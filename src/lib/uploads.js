import { cloudinary, WORKER_URL } from "./config";

/**
 * Upload an image to Cloudinary with an UNSIGNED preset.
 * Unsigned uploads only accept a few parameters (file, upload_preset, folder, public_id, tags).
 * Anything else, like `transformation` or `overwrite`, makes Cloudinary reject the request,
 * so those belong in the preset's settings in the Cloudinary dashboard.
 */
export function uploadImage(file, { folder, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", cloudinary.uploadPreset);
    if (folder) form.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
        resolve(body.secure_url);
      } else {
        reject(new Error(body?.error?.message || "Image upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading the image."));
    xhr.send(form);
  });
}

/** Upload an audio file to Cloudflare R2 through your worker. Resolves with the public URL. */
export function uploadAudio(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `songs/${Date.now()}_${safeName}`;

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${WORKER_URL}/${key}`);
    xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Audio upload failed (${xhr.status}). ${xhr.responseText || ""}`.trim()));
        return;
      }
      try {
        const { url } = JSON.parse(xhr.responseText);
        if (!url) throw new Error("missing url");
        resolve(url);
      } catch {
        reject(new Error("The upload worker did not return a file URL."));
      }
    };
    xhr.onerror = () =>
      reject(new Error("Network error while uploading audio. Check the worker URL and its CORS settings."));
    xhr.send(file);
  });
}

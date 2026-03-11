import request, { createHeaders } from "/api/request.js";

export async function getGalleries({ userId, cb } = {}) {
  let url = `/galleries`;
  if (userId) url += `?userId=${userId}`;

  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function getGallery({ id, cb } = {}) {
  const url = `/galleries/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function createGallery({ body, cb } = {}) {
  const url = "/galleries";
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "POST", headers, body, cb });
}

export async function deleteGallery({ id, body, cb } = {}) {
  const url = `/galleries/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, body, cb });
}

export async function updateGallery({ id,  body,  cb } = {}) {
  let url = `/galleries/${id}`;
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "PATCH", headers, body, cb });
}

export async function deleteGalleryImage({ galleryId, imageId, cb } = {}) {
  const url = `/galleries/${galleryId}/images/${imageId}`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, cb });
}

export async function deleteSelectedGalleryImages({ galleryId, body, cb } = {}) {
  const url = `/galleries/${galleryId}/images`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers,body, cb });
}
export async function deleteAllGalleryImages({ galleryId,  cb } = {}) {
  const url = `/galleries/${galleryId}/images?all=true`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, cb });
}

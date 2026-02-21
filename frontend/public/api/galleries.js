import request, { createHeaders } from "/api/request.js";

export async function getGalleries({ userId, cb } = {}) {
  console.log("get galleries");
  let url = `/galleries`;
  if (userId) url += `?userId=${userId}`;

  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function getGallery({ id, cb } = {}) {
  console.log("get gallery");
  const url = `/galleries/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function createGallery({ body, cb } = {}) {
  console.log("upload image");
  const url = "/galleries";
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "POST", headers, body, cb });
}

export async function deleteGallery({ id, body, cb } = {}) {
  console.log("delete gallery");
  const url = `/galleries/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, body, cb });
}

export async function updateGallery({ id,  body,  cb } = {}) {
  console.log("update gallery image");
  let url = `/galleries/${id}`;
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "PATCH", headers, body, cb });
}

export async function deleteGalleryImage({ galleryId, imageId, cb } = {}) {
  console.log("delete gallery image");
  const url = `/galleries/${galleryId}/images/${imageId}`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, cb });
}

export async function deleteSelectedGalleryImages({ galleryId, body, cb } = {}) {
  console.log("delete selected gallery images");
  const url = `/galleries/${galleryId}/images`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers,body, cb });
}
export async function deleteAllGalleryImages({ galleryId,  cb } = {}) {
  console.log("delete all gallery images");
  const url = `/galleries/${galleryId}/images?all=true`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, cb });
}

import request, { createHeaders } from "/api/request.js";

export async function getPosts({ cb } = {}) {
  const url = "/posts";
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function getPost({ id, cb } = {}) {
  const url = `/posts/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function createPost({ body, cb } = {}) {
  const url = "/posts";
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "POST", headers, body, cb });
}

export async function updatePost({ id, body, cb } = {}) {
  const url = `/posts/${id}`;
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "PATCH", headers, body, cb });
}

export async function deletePost({ id, body, cb } = {}) {
  const url = `/posts/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, body, cb });
}

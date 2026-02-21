import request, { createHeaders } from "/api/request.js";

export async function getPosts({ cb } = {}) {
  console.log("get posts");
  const url = "/posts";
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function getPost({ id, cb } = {}) {
  console.log("get post");
  const url = `/posts/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function createPost({ body, cb } = {}) {
  console.log("create post");
  const url = "/posts";
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "POST", headers, body, cb });
}

export async function updatePost({ id, body, cb } = {}) {
  console.log("update post");
  const url = `/posts/${id}`;
  const headers = createHeaders({ isFormData: true });
  return await request({ url, method: "PATCH", headers, body, cb });
}

export async function deletePost({ id, body, cb } = {}) {
  console.log("delete post");
  const url = `/posts/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "DELETE", headers, body, cb });
}

import request, { createHeaders, auth } from "/api/request.js";
import * as authApi from "/api/auth.js";

export async function getUsers({ cb } = {}) {
  console.log("get users");
  const url = "/users";
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function getUser({ id, cb } = {}) {
  console.log("get user");
  const url = `/users/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "GET", headers, cb });
}

export async function updateUser({ id, body, cb } = {}) {
  console.log("update user");
  const url = `/users/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "PATCH", headers, body, cb });
}

export async function deleteUser({ id, cb } = {}) {
  console.log("deleteUser");
  const url = "/users/" + id;
  const headers = createHeaders();
  const data = await request({ url, method: "DELETE", headers, cb });
  if (!data.success) return data;
  if (data.data._id.toString() === auth.currentUser._id.toString()) {
    alert(data.message || "Your account deleted");
    localStorage.removeItem("accessToken");
    // window.location.href = "/login";
    alert("You have successfully logged out.");
  } else {
    alert(data.message || "User accound deleted");
  }
  return data;
}

export async function updateUserByAdmin({ id, body, cb } = {}) {
  console.log("update user by admin");
  const url = `/users/update-user-by-admin/${id}`;
  const headers = createHeaders();
  return await request({ url, method: "PATCH", headers, body, cb });
}
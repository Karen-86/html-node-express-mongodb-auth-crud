import request, { createHeaders, auth } from "/api/request.js";

export async function register({ body, cb } = {}) {
  console.log("register");
  const url = "/auth/register";
  const headers = createHeaders();
  const data = await request({
    url,
    method: "POST",
    headers,
    body,
    cb,
  });
  if (!data.success) return data;
  localStorage.setItem("accessToken", data.accessToken);
  // window.location.href = "/dashboard";
  alert(data.message || "You have successfully registered.");
  alert("You have successfully logged in.");

  return data;
}

export async function login({ body, cb } = {}) {
  console.log("login");
  const url = "/auth/login";
  const headers = createHeaders();
  const data = await request({
    url,
    method: "POST",
    headers,
    body,
    cb,
  });

  if (!data.success) return data;
  localStorage.setItem("accessToken", data.accessToken);
  // window.location.href = "/dashboard";
  alert("You have successfully logged in.");

  return data;
}

export async function logout({ cb } = {}) {
  console.log("logout");
  const url = "/auth/logout";
  const headers = createHeaders();
  const data = await request({ url, method: "DELETE", headers, cb });
  if (!data.success) return data;
  localStorage.removeItem("accessToken");
  // window.location.href = "/login";
  alert("You have successfully logged out.");
  return data;
}

export async function getProfile({ cb } = {}) {
  console.log("getProfile");
  const url = "/auth/me";
  const headers = createHeaders();
  const data = await request({ url, method: "GET", headers, cb });
  if (!data.success) {
    // if (window.location.href.includes("dashboard")) window.location.href = "/login";
    return data;
  }

  // if (!window.location.href.includes("dashboard")) window.location.href = "/dashboard";

  auth.currentUser = data.data;
  console.log({ auth });
  return data;
}

export async function updatePassword({ body, cb } = {}) {
  console.log("update password");
  const url = `/auth/update-password`;
  const headers = createHeaders();
  const data = await request({ url, method: "PATCH", headers, body, cb });
  if (!data.success) return data;
  alert(data.message || "Password changed");
  localStorage.removeItem("accessToken");
  // window.location.href = "/login";
  alert("You have successfully logged out.");
  return data;
}
export async function addPassword({ body, cb } = {}) {
  console.log("add password");
  const url = `/auth/add-password`;
  const headers = createHeaders();
  const data = await request({ url, method: "PATCH", headers, body, cb });
  if (!data.success) return data;
  alert(data.message || "Password added");
  localStorage.removeItem("accessToken");
  // window.location.href = "/login";
  alert("You have successfully logged out.");
  return data;
}

export async function confirmAddPassword({ token, cb } = {}) {
  console.log("confirm add password");
  const url = `/auth/confirm-add-password?token=${token}`;
  const headers = createHeaders();
  const data = await request({ url, method: "PATCH", headers, cb });
  // if (!data.success) return data;
  // alert(data.message || 'Confirm verify email')
  return data;
}

export async function verifyEmail({ body, cb } = {}) {
  console.log("verify email");
  const url = `/auth/verify-email`;
  const headers = createHeaders();
  const data = await request({ url, method: "PATCH", headers, body, cb });
  if (!data.success) return data;
  alert(data.message || "verify email");
  return data;
}

export async function confirmVerifyEmail({ token, cb } = {}) {
  console.log("confirm verify email");
  const url = `/auth/confirm-verify-email?token=${token}`;
  const headers = createHeaders();
  const data = await request({ url, method: "PATCH", headers, cb });
  // if (!data.success) return data;
  // alert(data.message || 'Confirm verify email')
  return data;
}

export async function updateEmail({ body, cb } = {}) {
  console.log("update email");
  const url = `/auth/update-email`;
  const headers = createHeaders();
  const data = await request({ url, method: "PATCH", headers, body, cb });
  if (!data.success) return data;
  alert(data.message || "update email");
  return data;
}

export async function confirmUpdateEmail({ token, cb } = {}) {
  console.log("confirm update email");
  const url = `/auth/confirm-update-email?token=${token}`;
  const headers = createHeaders();
  const data = await request({ url, method: "PATCH", headers, cb });
  // if (!data.success) return data;
  // alert(data.message || 'Confirm update email')
  return data;
}

export async function forgotPassword({ body, cb } = {}) {
  console.log("forgot password email");
  const url = `/auth/forgot-password`;
  const headers = createHeaders();
  const data = await request({ url, method: "POST", headers, body, cb });
  if (!data.success) return data;
  alert(data.message || "forgot password");
  return data;
}

export async function resetPassword({ token, body, cb } = {}) {
  console.log("reset password email");
  const url = `/auth/reset-password?token=${token}`;
  const headers = createHeaders();
  const data = await request({ url, method: "POST", headers, body, cb });
  if (!data.success) return data;
  alert(data.message || "reset password");
  return data;
}

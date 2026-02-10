import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.5/dist/esm/axios.min.js";

export const auth = {
  currentUser: null,
};

const urls = {
  // apiApp: "https://html-node-express-mongodb-auth-crud-xqo4.onrender.com/api/v1", // production
  apiApp: "http://localhost:8000/api/v1", // development
};

export function createHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  return headers;
}

const api = axios.create({
  baseURL: urls.apiApp,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && err.response?.data?.message === "jwt expired" && !original._retry) {
      original._retry = true;

      try {
        const res = await axios.post(urls.apiApp + "/auth/refresh", null, { withCredentials: true });
        localStorage.setItem("accessToken", res.data.accessToken);

        // retry original request
        return api(original);
      } catch (err) {
        err.interceptorsError = true
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  },
);

export default async function request(options) {
  const { url, method = "GET", headers = {}, body = null, cb = () => {} } = options;

  try {
    const response = await api({
      url,
      method,
      headers,
      ...(body && { data: body }),
    });

    cb(response.data);
    return response.data;
  } catch (err) {
    // Server responded (4xx / 5xx)
    if (err.response) {
      console.log("server response: ", err.response.data);
      if (err.response?.data?.message !== "jwt expired" && !url.endsWith("/auth/me")) alert(err.response.data.message || "Error");
      if (err.response?.data?.message === "Session expired or user no longer exists") {
        localStorage.removeItem("accessToken");
        // window.location.href = "/login";
        alert(err.response?.data.message);
        alert("You have successfully logged out.");
      }
      if (err.interceptorsError) {
        localStorage.removeItem("accessToken");
        // window.location.href = "/login";
        alert("You have successfully logged out.");
      }
      cb(err.response.data);
      return err.response.data;
    }

    // Request sent but no response (network / timeout / CORS)
    if (err.request) {
      console.log("no response: ", err);
      alert(err.message || "Network Error");
      const res = { success: false, message: err.message || "Network Error" };
      cb(res);
      return res;
    }

    // Request setup error
    console.log("request setup error: ", err);
    alert(err.message || "Network Error");
    const res = { success: false, message: err.message || "Network Error" };
    cb(res);
    return res;
  }
}

// ============================================================

// FETCH
// export const auth = {
//   currentUser: null,
// };

// const urls = {
//   apiApp: "http://localhost:8000/api/v1",
// };

// export const createHeaders = () => {
//   const accessToken = localStorage.getItem("accessToken");

//   const headers = {
//     "Content-Type": "application/json",
//   };

//   if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

//   return headers;
// };

// export async function refresh() {
//   console.log("refresh");
//   const url = urls.apiApp + "/auth/refresh";

//   const response = await fetch(url, {
//     method: "POST",
//     credentials: "include",
//   });

//   const data = await response.json();
//   if (!response.ok) throw new Error(data?.message || "Refresh failed 1");

//   localStorage.setItem("accessToken", data.accessToken);
// }

// export default async function request(options) {
//   const { url, method = "GET", headers = {}, body = null, cb = () => {}, retried = false } = options;

//   try {
//     const response = await fetch(urls.apiApp + url, {
//       method,
//       headers,
//       ...(body ? { body: JSON.stringify(body) } : {}),
//       credentials: "include",
//     });

//     const data = await response.json();

//     // Server responded (2xx / 4xx / 5xx)
//     if (!response.ok) {
//       if (data?.message === "jwt expired" && !retried) {
//         try {
//           await refresh();
//           const newheaders = createHeaders({ withToken: true });
//           return await request({ ...options, headers: newheaders, retried: true });
//         } catch (err) {
//           alert(err.message || "Refresh failed 2");

//           localStorage.removeItem("accessToken");
//           // window.location.href = "/login";
//           alert("You have successfully logged out.");
//           return data;
//         }
//       }

//       console.log("server response:", data);
//       if (!url.endsWith("/auth/me")) alert(data?.message || "Error");
//       cb(data);
//       return data;
//     }

//     cb(data);
//     return data;
//   } catch (err) {
//     // Request sent but no response (network / CORS / abort)
//     console.log("no response:", err);
//     alert(err.message || "Network Error");
//     const res = { success: false, message: err.message || "Network Error" };
//     cb(res);
//     return res;
//   }
// }

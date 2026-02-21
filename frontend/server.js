import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.static(join(__dirname, "/public")));


// SITE
app.get("/home", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "site", "about.html"));
});

// AUTH
app.get("/login", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "register.html"));
});

app.get("/auth/action/confirm-update-email", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "confirm-update-email.html"));
});

app.get("/auth/action/confirm-verify-email", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "confirm-verify-email.html"));
});

app.get("/auth/action/confirm-add-password", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "confirm-add-password.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "forgot-password.html"));
});

app.get("/reset-password", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "reset-password.html"));
});

app.get("/auth/action/reset-password", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "reset-password.html"));
});

app.get("/auth/action/success", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "auth", "success.html"));
});



// DASHBOARD
app.get("/dashboard", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "dashboard", "index.html"));
});

app.get("/dashboard/profile", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "dashboard", "profile.html"));
});

app.get("/dashboard/settings", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "dashboard", "settings.html"));
});

app.get("/dashboard/users/:id", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "dashboard", "user-details.html"));
});

app.get("/dashboard/posts/:id", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "dashboard", "post-details.html"));
});

app.get("/dashboard/galleries/:id", (req, res) => {
  res.sendFile(join(__dirname, "public", "pages", "dashboard", "gallery-details.html"));
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(join(__dirname, "public", "pages", "not-found.html"));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

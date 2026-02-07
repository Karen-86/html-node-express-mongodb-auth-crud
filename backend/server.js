import app from './app.js'
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 8001;

connectDB(() => {
  app.listen(PORT, () => {
    console.log(`Running in ${process.env.NODE_ENV} mode`);
    console.log(`Server running on port ${PORT}`);
  });
});

import app from './app.js'
import connectDB from './lib/monogoDB/config.js';
import connectCloudinary from './lib/cloudinary/config.js';

const PORT = process.env.PORT || 8001;

connectDB(() => {
  connectCloudinary()
  app.listen(PORT, () => {
    console.log(`Running in ${process.env.NODE_ENV} mode`);
    console.log(`Server running on port ${PORT}`);
  });
});

import { v2 as cloudinary } from "cloudinary";

export const createImage = async ({ buffer, folderPath, publicId }) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: folderPath,
          public_id: publicId,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      )
      .end(buffer);
  });

  return result;
};

export const deleteImage = async ({ publicId }) => {
  const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
  
  return result;
};

export const deleteImages = async ({ publicIds }) => {
  const result = await cloudinary.api.delete_resources(publicIds, {
    resource_type: "image",
    invalidate: true,
  });

  return result;
};

export const deleteImagesAndFolder = async ({ folderPath }) => {
  const result = await cloudinary.api.delete_resources_by_prefix(folderPath);

  await cloudinary.api.delete_folder(folderPath);

  return result;
};

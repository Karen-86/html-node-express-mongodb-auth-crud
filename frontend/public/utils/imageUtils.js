export const convertToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read blob as Base64"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading file as Base64"));
    };
  });
};

const createError = (message, status = 400, data = null) => {
  const err = new Error(message);
  err.statusCode = status;
  if(data) err.data = data
  return err;
};

export default createError;

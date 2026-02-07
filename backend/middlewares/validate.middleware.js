const validate = (schema) => (req, _, next) => {

  const { error, value } = schema.validate(req.body || {}, { abortEarly: false });

  if (error) {
    const err = new Error(error.details.map((d) => d.message).join(", "));
    err.statusCode = 400;
    return next(err); 
  }

  req.filteredBody = value; 
  next();
};

export default validate
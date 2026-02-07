// middlewares:  depends on included middlewares
const anyOf =
  (...middlewares) =>
  async (req, res, next) => {
    
    let firstError;
    let lastError;

    for (const mw of middlewares) {
      try {
        await new Promise((resolve, reject) => {
          mw(req, res, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });

        // one middleware passed → allow request
        return next();
      } catch (err) {
        if (!firstError) firstError = err;
        lastError = err;
      }
    }

    // all failed
    next(firstError);
  };

export default anyOf;

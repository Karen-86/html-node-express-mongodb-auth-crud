import mongoose from "mongoose";
import createError from "../utils/createError.js";

const loadResource =
  ({ paramKey = "id", reqKey = "resource", Model, selectFields = "" }) =>
  async (req, _, next) => {
    const id = req.params[paramKey];

    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError("Invalid ID", 400));

    const query = selectFields ? Model.findById(id).select(selectFields) : Model.findById(id);
    const existingResource = await query;

    if (!existingResource) return next(createError(`${Model.modelName} not found`, 404));

    req[reqKey] = existingResource;

    next();
  };

export default loadResource;

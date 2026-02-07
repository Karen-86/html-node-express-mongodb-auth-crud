import mongoose from "mongoose";
import createError from "../utils/createError.js";

const loadResource =
  (Model, reqKey = "resource", selectFields = "") =>
  async (req, _, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError("Invalid ID",400))

    const query = selectFields ? Model.findById(id).select(selectFields) : Model.findById(id);
    const existingResource = await query;

    if (!existingResource) return next(createError(`${Model.modelName} not found`,404))

    req[reqKey] = existingResource;

    next();
  };

export default loadResource;

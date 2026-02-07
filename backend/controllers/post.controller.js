import Post from "../models/post.model.js";
import createError from '../utils/createError.js'

// @GET: /posts | middlewares: isAuthenticated
const getPosts = async (_, res, next) => {
  try {
    const posts = await Post.find();

    res.status(200).json({
      success: true,
      message: "all posts",
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};

// @GET: /posts/:id | middlewares: isAuthenticated, loadUser, loadResource
const getPost = async (req, res, next) => {

  const post = req.post;

  try {
    res.status(200).json({
      success: true,
      message: "post found successfully",
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

// @POST: /posts/:id | middlewares: isAuthenticated, validate, loadUser
const createPost = async (req, res, next) => {

  try {
    const date = req.filteredBody.date ? new Date(req.filteredBody.date) : new Date();
    if (isNaN(date)) throw createError('Invalid date', 400)

    const createdPost = await Post.create({ ...req.filteredBody, userId: req.user._id.toString(), author: req.user.name, date });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: createdPost,
    });
  } catch (err) {
    console.error(`=createPost= Error: ${err}`);
    next(err);
  }
};

// @PATCH: /posts/:id | middlewares: isAuthenticated, validate, loadUser, loadResource, isResourceOwner
const updatePost = async (req, res, next) => {

  try {
    Object.assign(req.post, req.filteredBody);
    const updatedPost = await req.post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (err) {
    console.error(`=updatePost= Error: ${err}`);
    next(err);
  }
};

// @DELETE: /posts/:id | middlewares: isAuthenticated, loadUser, loadResource, isResourceOwner
const deletePost = async (req, res, next) => {

  try {
    const post = req.post;

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: post,
    });
  } catch (err) {
    console.error(`=deletePost= Error: ${err}`);
    next(err);
  }
};

export { getPosts, getPost, createPost, updatePost, deletePost };

import { Router } from "express";

import authenticate from "../middlewares/auth.js";
import adminController from "../controllers/adminController.js";

const router = Router();

//?  @desc   Dashboard
//*  @route  GET /dashboard
router.get("/", authenticate, adminController.getDashboard);

//?  @desc   Dashboard add post
//*  @route  GET /dashboard/add-post
router.get("/add-post", authenticate, adminController.getAddPost);

//?  @desc   Dashboard edit post
//*  @route  GET /dashboard/edit-post/:id
router.get("/edit-post/:id", authenticate, adminController.getEditPost);

//?  @desc   Dashboard delete post
//*  @route  GET /dashboard/delete-post/:id
router.get("/delete-post/:id", authenticate, adminController.deletePost);

//?  @desc   Dashboard handle post creation
//*  @route  POST /dashboard/add-post
router.post("/add-post", authenticate, adminController.createPost);

//?  @desc   Dashboard handle post edit
//*  @route  POST /dashboard/edit-post/:id
router.post("/edit-post/:id", authenticate, adminController.editPost);

//?  @desc   Dashboard handle upload image
//*  @route  POST /dashboard/image-upload
router.post("/image-upload", authenticate, adminController.uploadImage);

export default router;

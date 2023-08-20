import { Router } from "express";
import { BlogController } from "../controllers/blogController.js";

const router = Router();

//?  @desc   Weblog Index Page
//*  @route  GET /
router.get("/", BlogController.getIndex);

//?  @desc   Weblog Post Page
//*  @route  GET /post/:id
router.get("/post/:id", BlogController.getPost);

export default router;

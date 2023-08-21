import { Router } from "express";
import { BlogController } from "../controllers/blogController.js";

const router = Router();

//?  @desc   Weblog Index Page
//*  @route  GET /
router.get("/", BlogController.getIndex);

//?  @desc   Weblog Post Page
//*  @route  GET /post/:id
router.get("/post/:id", BlogController.getPost);

//?  @desc   Contact Us Page
//*  @route  GET /contact
router.get("/contact", BlogController.getContact);

//?  @desc   Numric Captcha
//*  @route  GET /captcha.png
router.get("/captcha.png", BlogController.getCaptcha);

//?  @desc   Handle Contact Us Page
//*  @route  POST /contact
router.post("/contact", BlogController.handleContact);

export default router;

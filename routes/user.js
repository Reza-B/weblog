import { Router } from "express";

import userController from "../controllers/userController.js";
import authenticated from "../middlewares/auth.js";

const router = Router();

// GET - Register Page
router.get("/register", userController.register);

//POST - Register Page
router.post("/register", userController.createUser);

// GET - Login Page
router.get("/login", userController.login);

//POST - Login page
router.post("/login", userController.handleLogin, userController.remember);

//GET - logout
router.get("/logout", authenticated, userController.logout);

export default router;

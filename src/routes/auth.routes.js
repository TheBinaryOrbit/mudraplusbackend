import { Router } from "express";
import { AuthController } from "../controller/auth.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const authRouter = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

authRouter.post("/login", authController.login);

authRouter.post("/logout", authMiddleware.verifyToken, authController.logout);
authRouter.post("/adminlogin", authController.adminLogin);

export { authRouter };
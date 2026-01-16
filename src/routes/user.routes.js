import { Router } from "express";
import { UserController } from "../controller/user.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";


const userRouter = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();



userRouter.post("/register", userController.registerUser);

userRouter.use(authMiddleware.verifyToken);

userRouter.get("/profile-status", userController.profileStatus);
userRouter.get("/profile", userController.getProfile);
userRouter.put("/profile", userController.updateProfile);
userRouter.post("/document/:doctype", userController.uploadDocument);
userRouter.get("/documents", userController.getDocuments);
userRouter.put("/document/:doctype", userController.updateDocument);
userRouter.patch("/submit-kyc", userController.submitkyc);

export { userRouter };
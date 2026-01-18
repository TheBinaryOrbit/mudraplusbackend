import { Router } from "express";
import { NotificationController } from "../controller/notification.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";


const notificationRouter = Router();
const notificationController = new NotificationController();
const authMiddleware = new AuthMiddleware();    

notificationRouter.use(authMiddleware.verifyToken);

notificationRouter.get("/", notificationController.getNotifications);
notificationRouter.put("/", notificationController.updateNotifications);
notificationRouter.get("/count", notificationController.getNotificationCount);


export  {notificationRouter};
import { Router } from "express";
import { TransactionController } from "../controller/transactioncontroller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const transactionRouter = Router();
const transactionController = new TransactionController();
const authMiddleware = new AuthMiddleware();


transactionRouter.get("/orders/:orderId", transactionController.getOrderDeails); // no token required
transactionRouter.post("/order", authMiddleware.verifyToken, transactionController.createOrder);
transactionRouter.post("/", transactionController.createTransaction);
transactionRouter.get("/loan/:loanId", authMiddleware.verifyToken, transactionController.getTrascationsByLoanId);
transactionRouter.get("/user", authMiddleware.verifyToken, transactionController.getTrascationsByUserId);
export { transactionRouter };
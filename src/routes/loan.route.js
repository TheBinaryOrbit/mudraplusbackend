import { Router } from "express";
import { LoanController } from "../controller/loan.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const loanRouter = Router();
const loanController = new LoanController();
const authMiddleware = new AuthMiddleware();



loanRouter.post("/", authMiddleware.verifyToken ,loanController.createLoan);
loanRouter.patch("/apply/:id", authMiddleware.verifyToken ,loanController.appliedLoan);
loanRouter.get("/:id", authMiddleware.verifyToken ,loanController.getLoanById);
loanRouter.get("/", authMiddleware.verifyToken ,loanController.getLoansByUserId);



loanRouter.patch("/review/:id", loanController.reviewLoan); // admin
loanRouter.patch("/approve/:id", loanController.approveLoan); // admin

export { loanRouter };
import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { BankController } from "../controller/bank.controller.js";

const bankRouter = Router();
const bankController = new BankController();
const authMiddleware = new AuthMiddleware();

bankRouter.use(authMiddleware.verifyToken);

bankRouter.get("/", bankController.getbankDetails);
bankRouter.post("/", bankController.addBankDetails);
bankRouter.put("/:id", bankController.updateBankDetails);
bankRouter.delete("/:id", bankController.deleteBankDetails);

export { bankRouter };

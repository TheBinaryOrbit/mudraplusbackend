import { Router } from "express";
import { AdminController } from "../controller/admin.controller.js";
import { AgentUserController } from "../controller/agentuser.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { LoanController } from "../controller/loan.controller.js";

const adminRouter = Router();
const adminController = new AdminController();
const agentUserController = new AgentUserController();
const authMiddleware = new AuthMiddleware();
const loanController = new LoanController();

// admin relateded to agents
adminRouter.post("/create-admin", authMiddleware.verifyAdminToken, adminController.createAdmin); // ✅
adminRouter.get("/getalladmins", authMiddleware.verifyAdminToken, adminController.getAllAdmins); // ✅
adminRouter.post("/assingn-agent", authMiddleware.verifyAdminToken, agentUserController.assignUser); // ✅
adminRouter.delete("/unassingn-agent", authMiddleware.verifyAdminToken, agentUserController.unAssingnUser);
adminRouter.post("/assign-multiple-users", authMiddleware.verifyAdminToken, agentUserController.assignManyUsersToAgent); // ✅
adminRouter.get("/agent-users/:id", authMiddleware.verifyAdminToken, agentUserController.getAgentUsers);// ✅
// user 
adminRouter.get("/users", authMiddleware.verifyAgentToken, adminController.getAllUsers); // ✅

adminRouter.patch("/change-password", authMiddleware.verifyAgentToken, adminController.changeAdminPassword); // admin and agent both can access // ✅

// admin releated to users  

adminRouter.patch("/block-user/:id", authMiddleware.verifyAdminToken, adminController.blockAccount);// ✅
adminRouter.patch("/restore-user/:id", authMiddleware.verifyAdminToken, adminController.restoreUserAccount);// ✅
adminRouter.patch("/update-kyc-status/:id", authMiddleware.verifyAdminToken, adminController.kycVerification);// ✅

adminRouter.get("/user/:id", authMiddleware.verifyAgentToken, adminController.getUserById); // ✅  // admin and agent both can access




// admin related to loans
adminRouter.get("/loans", authMiddleware.verifyAgentToken, adminController.getAllloans); // admin
adminRouter.get("/loan/:id", authMiddleware.verifyAgentToken, adminController.getSpecficLoan); // admin
adminRouter.patch("/loan/review/:id", authMiddleware.verifyAdminToken, loanController.reviewLoan); // admin
adminRouter.patch("/loan/approve/:id", authMiddleware.verifyAdminToken, loanController.approveLoan); // admin
adminRouter.patch("/loan/followup/:id", authMiddleware.verifyAgentToken, adminController.createFollowup); // admin
adminRouter.post("/loan/create-payment-link", authMiddleware.verifyAdminToken, adminController.generatePaymentLink); // admin



export { adminRouter };




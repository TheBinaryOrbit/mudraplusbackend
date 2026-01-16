import { Router } from "express";
import { AddressController } from "../controller/address.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../config/multerConfig.js";

const addressRouter = Router();
const addressController = new AddressController();
const authMiddleware = new AuthMiddleware();

addressRouter.use(authMiddleware.verifyToken);

addressRouter.get("/", addressController.getAddress);
addressRouter.post("/residential", upload.single('residentialAddressProof') ,addressController.addAddress);
addressRouter.post("/employment" , upload.single('employmentAddressProof') ,addressController.addAddress);
addressRouter.put("/residential/:id", upload.single('residentialAddressProof') ,addressController.updateAddress);
addressRouter.put("/employment/:id", upload.single('employmentAddressProof') ,addressController.updateAddress);

export { addressRouter };

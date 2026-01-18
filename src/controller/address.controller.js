import { AddressService } from "../services/address.service.js";
import { DocumentService } from "../services/document.service.js";
import { UserService } from "../services/user.service.js";
import { EventService } from "../services/event.service.js";


export class AddressController {
    constructor() {
        this.addressService = new AddressService();
        this.documentService = new DocumentService();
        this.userService = new UserService();
        this.eventService = new EventService();
    }

    addAddress = async (req, res) => {
        const user = req.user; // from auth middleware
        const addressData = req.body;

        const file = req.file;
        console.log("Uploaded file: ", file);


        const errors = [];
        // validate address data
        if (!addressData.street || !addressData.city || !addressData.state || !addressData.pinCode || !addressData.addressType) {
            if (!addressData.street) errors.push({ field: "street", message: "Street is required" });
            if (!addressData.city) errors.push({ field: "city", message: "City is required" });
            if (!addressData.state) errors.push({ field: "state", message: "State is required" });
            if (!addressData.pinCode) errors.push({ field: "pinCode", message: "Pin code is required" });
            if (!addressData.addressType) errors.push({ field: "addressType", message: "Address type is required" });
            return res.status(400).json({ message: 'All fields are required', errors });
        }

        if (!addressData.addressType.match(/^(residential|employment)$/i)) {
            errors.push({ field: "addressType", message: "Address type must be one of: residential, employment" });
            return res.status(400).json({ message: 'Address type is invalid', errors });
        }

        try {
            const [ newaddress ] = await Promise.all([
                this.addressService.addAddress(user.id, addressData),
                file ? this.documentService.uploadDocument(user.id , file.fieldname , file.filename) : null
            ]);

            // activity log
            await this.eventService.createEvent(user.id, 'activity' , {
                title: 'New Address Added',
                message: `You have successfully added a new ${addressData.addressType} address on ${new Date().toLocaleString()}`
            });

            return res.status(201).json(newaddress);
            
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to add address', message: 'Internal server error' });
        }
    }

    updateAddress = async (req, res) => {
        const user = req.user; // from auth middleware
        const addressId = parseInt(req.params.id);
        const updateData = req.body;

        const file = req.file;
        console.log("Uploaded file: ", file);


        // validate address data
        const errors = [];

        if (!updateData.street || !updateData.city || !updateData.state || !updateData.pinCode || !updateData.addressType) {
            if (!updateData.street) errors.push({ field: "street", message: "Street is required" });
            if (!updateData.city) errors.push({ field: "city", message: "City is required" });
            if (!updateData.state) errors.push({ field: "state", message: "State is required" });
            if (!updateData.pinCode) errors.push({ field: "pinCode", message: "Pin code is required" });
            if (!updateData.addressType) errors.push({ field: "addressType", message: "Address type is required" });
            return res.status(400).json({ message: 'All fields are required', errors });
        }


        if (updateData.addressType && !updateData.addressType.match(/^(residential|employment)$/i)) {
            errors.push({ field: "addressType", message: "Address type must be one of: residential, employment" });
            return res.status(400).json({ message: 'Address type is invalid', errors });
        }

        try {            
            const [ updatedAddress ] = await Promise.all([
                this.addressService.updateAddress(user.id, addressId, updateData),
                file ? this.documentService.updateDocument(user.id , file.fieldname , file.filename) : null
            ]);

            // activity log
            await this.eventService.createEvent(user.id, 'activity' , {
                title: 'Address Updated',
                message: `You have successfully updated a ${updateData.addressType} address on ${new Date().toLocaleString()}`
            });

            return res.status(200).json(updatedAddress);
        }
        catch (error) {
            console.log("Error updating address: ", error);
            res.status(500).json({ error: 'Failed to update address', message: 'Internal server error' });
        }
    }

    getAddress = async (req, res) => {
        try {
            const user = req.user; // from auth middleware
            const addressType = req.query.addresstype;

            if(!addressType || !addressType.match(/^(residential|employment)$/i)) {
                return res.status(400).json({ message: 'addressType query parameter is required and must be one of: residential, employment' });
            }

            const kycstatus = await this.userService.kycstatus(user.id);
            const address = await this.addressService.getAddressByUserIdAndAddressType(user.id, addressType);
            res.status(200).json({address , kycstatus});
        } catch (error) {
            res.status(500).json({ error: 'Failed to get addresses', message: error.message });
        }

    }
}
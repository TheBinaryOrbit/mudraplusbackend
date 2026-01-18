import { BankDetailsService } from "../services/bank.service.js";
import { EventService } from "../services/event.service.js";
export class BankController {
    constructor() {
        this.bankDetailsService = new BankDetailsService();
        this.eventService = new EventService();
    }

    addBankDetails = async (req, res) => {
        try {
            const user = req.user; // from auth middleware
            const bankData = req.body;

            // validate bank data
            if (!bankData.bankName || !bankData.accountNumber || !bankData.ifscCode || !bankData.accountHolderName) {
                const errors = [];
                if (!bankData.bankName) errors.push({ field: "bankName", message: "Bank name is required" });
                if (!bankData.accountNumber) errors.push({ field: "accountNumber", message: "Account number is required" });
                if (!bankData.ifscCode) errors.push({ field: "ifscCode", message: "IFSC code is required" });
                if (!bankData.accountHolderName) errors.push({ field: "accountHolderName", message: "Account holder name is required" });
                return res.status(400).json({ message: 'All fields are required', errors });
            }

            const newBankDetails = await this.bankDetailsService.addBankDetails(user.id, bankData);
            await this.eventService.createEvent(user.id, 'activity' , {
                title: 'New Bank Details Added',
                message: `You have successfully added new bank details for ${bankData.bankName} on ${new Date().toLocaleString()}`
            });
            res.status(201).json(newBankDetails);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to add bank details', message: error.message });
        }
    }

    updateBankDetails = async (req, res) => {
        try {
            const user = req.user; // from auth middleware
            const bankDetailsId = parseInt(req.params.id);

            const bankData = req.body;

            // validate bank data
            if (!bankData.bankName || !bankData.accountNumber || !bankData.ifscCode || !bankData.accountHolderName) {
                const errors = [];
                if (!bankData.bankName) errors.push({ field: "bankName", message: "Bank name is required" });
                if (!bankData.accountNumber) errors.push({ field: "accountNumber", message: "Account number is required" });
                if (!bankData.ifscCode) errors.push({ field: "ifscCode", message: "IFSC code is required" });
                if (!bankData.accountHolderName) errors.push({ field: "accountHolderName", message: "Account holder name is required" });
                return res.status(400).json({ message: 'All fields are required', errors });
            }

            const updatedBankDetails = await this.bankDetailsService.updateBankDetails(bankDetailsId, user.id, bankData);

            await this.eventService.createEvent(user.id, 'activity' , {
                title: 'Bank Details Updated',
                message: `You have successfully updated bank details for ${bankData.bankName} on ${new Date().toLocaleString()}`
            });

            return res.status(200).json(updatedBankDetails);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update bank details', message: error.message });
        }
    }

    deleteBankDetails = async (req, res) => {
        try {
            const user = req.user; // from auth middleware
            const bankDetailsId = parseInt(req.params.id);
            const deletedBankDetails = await this.bankDetailsService.deleteBankDetails(bankDetailsId, user.id);

            // activity log
            await this.eventService.createEvent(user.id, 'activity' , {
                title: 'Bank Details Deleted',
                message: `You have successfully deleted bank details with ID ${bankDetailsId} on ${new Date().toLocaleString()}`
            });
            return res.status(200).json(deletedBankDetails);
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete bank details', message: error.message });
        }
    }

    getbankDetails = async (req, res) => {
        try {
            const user = req.user;
            const bankDetails = await this.bankDetailsService.getBankDetailsByUserId(user.id);
            res.status(200).json(bankDetails);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch bank details', message: error.message });
        }
    }
}
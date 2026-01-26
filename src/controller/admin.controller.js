import { AdminService } from "../services/admin.service.js";
import { hashPassword } from "../utils/password.utils.js";
import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";
import { EventService } from "../services/event.service.js";
import { LoanService } from "../services/loan.service.js";
import { FollowupService } from "../services/followup.service.js";
import { TransactionService } from "../services/transaction.service.js";

export class AdminController {
    constructor() {
        this.adminService = new AdminService();
        this.authService = new AuthService();
        this.userService = new UserService();
        this.eventService = new EventService();
        this.loanService = new LoanService();
        this.followupService = new FollowupService();
        this.transactionService = new TransactionService();
    }

    createAdmin = async (req, res) => {
        const admin = req.admin;

        if (admin.role !== 'admin') {
            return res.status(403).json({ error: 'Only superadmin can create new admin users' });
        }

        const adminData = req.body;
        if (!adminData.name || !adminData.email || !adminData.password || !adminData.role || !adminData.phone) {
            const errors = [];
            if (!adminData.name) errors.push({ field: "name", message: "Name is required" });
            if (!adminData.email) errors.push({ field: "email", message: "Email is required" });
            if (!adminData.password) errors.push({ field: "password", message: "Password is required" });
            if (!adminData.role) errors.push({ field: "role", message: "Role is required" });
            if (!adminData.phone) errors.push({ field: "phone", message: "Phone is required" });
            return res.status(400).json({ message: 'All fields are required', errors });
        }

        if (!admin.role.match(/^(admin|user)$/i)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        try {
            const existingAdmin = await this.adminService.getAdminByEmail(adminData.email);
            if (existingAdmin) {
                return res.status(409).json({ error: 'Admin with this email already exists' });
            }

            adminData.password = await hashPassword(adminData.password);
            const newAdmin = await this.adminService.createAdmin(adminData);
            newAdmin.password = undefined; // hide password in response
            newAdmin.isDeleted = undefined; // hide isDeleted in response
            res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create admin', message: error.message });
        }
    }

    getAllAdmins = async (req, res) => {
        const admin = req.admin;
        const type = req.query.type;


        if (admin.role !== 'admin') {
            return res.status(403).json({ error: 'Only superadmin can access all admins' });
        }

        const where = {};
        if (type === 'agent') {
            where.role = 'agent';
        }


        try {
            const admins = await this.adminService.getAllAdmins(where);
            res.status(200).json(admins);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve admins', message: error.message });
        }
    }


    // ======================== user related admin methods ======================== //


    changeAdminPassword = async (req, res) => {
        const admin = req.admin;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            const errors = [];
            if (!oldPassword) errors.push({ field: "oldPassword", message: "Old password is required" });
            if (!newPassword) errors.push({ field: "newPassword", message: "New password is required" });
            return res.status(400).json({ message: 'Both old and new passwords are required', errors });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        try {
            const admin = await this.adminService.getAdminByEmail(req.admin.email);
            const isOldPasswordValid = await this.authService.verifypassword(oldPassword, admin.password);

            if (!isOldPasswordValid) {
                return res.status(401).json({ error: 'Old password is incorrect' });
            }

            const hashedNewPassword = await hashPassword(newPassword);

            await this.adminService.updateAdminPassword(admin.id, hashedNewPassword);

            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to change password', message: error.message });
        }
    }

    getAllUsers = async (req, res) => {
        const admin = req.admin;
        const { isblocked, kycStatus , employmentType , page , limit } = req.query;
        const filters = {};

        if(isblocked === 'true' || isblocked === true) filters.isBlocked = true;
        if(kycStatus) filters.kycStatus = kycStatus;
        if(employmentType) filters.employmentType = employmentType;


        try {
            const users = admin.role === 'admin' ?
                await this.userService.getAllUsers(filters, page, limit) :
                await this.userService.getUsersByAgentId({ ...filters, agentId: admin.id }, page, limit);

            if (admin.role !== 'admin') {
                const filteredUsers = users.map(user => {
                    return user.user;
                });
                return res.status(200).json({ users: filteredUsers });
            }

            res.status(200).json({ users: users });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve users', message: error.message });
        }
    }

    getUserById = async (req, res) => {
        try {
            const admin = req.admin;
            const userId = parseInt(req.params.id);
            const field = req.query.field;


            const user = await this.userService.getSpecficUser(userId, field);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve user', message: error.message });
        }
    }

    blockAccount = async (req, res) => {
        try {
            const admin = req.admin;
            const userId = parseInt(req.params.id);

            const user = await this.userService.blockUser(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ message: 'User account blocked successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to block user account', message: error.message });
        }
    }

    restoreUserAccount = async (req, res) => {
        try {
            const admin = req.admin;
            const userId = parseInt(req.params.id);

            const user = await this.userService.restoreUser(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found or not blocked' });
            }

            res.status(200).json({ message: 'User account restored successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to restore user account', message: error.message });
        }
    }


    kycVerification = async (req, res) => {
        try {
            const admin = req.admin;
            const userId = parseInt(req.params.id);
            const { status } = req.body;



            if (!status || !['verified', 'rejected'].includes(status)) {
                return res.status(400).json({ error: 'Invalid KYC status. Must be either "verified" or "rejected"' });
            }

            if (status === "rejected" && !req.body.reason) {
                return res.status(400).json({ error: 'Rejection reason is required when KYC status is "rejected"' });
            }

            const user = await this.userService.updateKycStatus(userId, status);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }


            await this.eventService.createEvent(userId, 'notification', {
                title: 'KYC Status Updated',
                message: status === 'verified' ?
                    `Congratulations! Your KYC has been verified successfully on ${new Date().toLocaleString()}. You can now access all features of our platform.` :
                    `We regret to inform you that your KYC has been rejected on ${new Date().toLocaleString()}. Reason: ${req.body.reason}. Please resubmit your KYC documents for verification.`
            });

            res.status(200).json({ message: `User KYC ${status} successfully` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update KYC status', message: error.message });
        }
    }

    // ======================== user related admin methods ends ======================== //


    // ======================== loan related admin methods ======================== //

    getAllloans = async (req, res) => {
        try {
            const admin = req.admin;

            const loans = admin.role === 'admin' ?
                await this.loanService.getAllLoans() :
                await this.loanService.getLoanByAgentId(admin.id);

            res.status(200).json({ loans: loans });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve loans', message: error.message });
        }
    }

    getSpecficLoan = async (req, res) => {
        try {
            const admin = req.admin;
            const loanId = parseInt(req.params.id);
            const loan = await this.loanService.getSpecficLoan(loanId);

            if (!loan) {
                return res.status(404).json({ error: 'Loan not found' });
            }
            res.status(200).json({...loan , pfp : process.env.PROCESSING_FEE_PERCENTAGE});
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve loan', message: error.message });
        }
    }

    // ======================== loan related admin methods ends ======================== //

    // ========================== followup related admin methods ======================== //

    createFollowup = async (req, res) => {
        try {
            const admin = req.admin;
            const loanId = parseInt(req.params.id);
            const { userId, note, nextFollowUpDate, followUpType, followUpDate } = req.body;

            if (!userId || !note || !followUpType || !followUpDate) {
                const errors = [];
                if (!userId) errors.push({ field: "userId", message: "User ID is required" });
                if (!agentUserId) errors.push({ field: "agentUserId", message: "Agent User ID is required" });
                if (!note) errors.push({ field: "note", message: "Note is required" });
                if (!followUpType) errors.push({ field: "followUpType", message: "Follow Up Type is required" });
                if (!followUpDate) errors.push({ field: "followUpDate", message: "Follow Up Date is required" });
                return res.status(400).json({ message: 'All fields are required', errors });
            }

            if (followUpType !== 'call' && followUpType !== 'meeting' && followUpType !== 'email' && followUpType !== 'fieldVisit') {
                return res.status(400).json({ error: 'Invalid follow up type. Must be either "call", "meeting" or "email"' });
            }

            const followup = await this.followupService.createFollowUp({
                userId,
                agentUserId: admin.id,
                loanId,
                note,
                nextFollowUpDate,
                followUpType,
                followUpDate
            });

            res.status(201).json({ message: 'Follow up created successfully', followup });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create follow up', message: error.message });
        }
    }

    // ========================== followup related admin methods ends ======================== //


    // ======================= generate payment lnin ===============================//
    generatePaymentLink = async (req, res) => {
        try {
            const admin = req.admin;
            const { amount, loanId } = req.body;

            if (!amount || !loanId) {
                const errors = [];
                if (!amount) errors.push({ field: "amount", message: "Amount is required" });
                if (!loanId) errors.push({ field: "loanId", message: "Loan ID is required" });
                return res.status(400).json({ message: 'All fields are required', errors });
            }


            const loan = await this.loanService.getLoanById(loanId);

            if(amount > loan.remainingAmount) {
                return  res.status(400).json({ error: 'Amount exceeds remaining loan amount' });
            }


            const order = await this.transactionService.createOrder(amount, 'INR', loan.loanNumber);
            res.status(201).json(
                {
                    message: 'Payment link generated successfully',
                    order: {
                        orderId: order.id,
                        amount: order.amount,
                        currency: order.currency
                    },
                    link: `https://mudraplus.com/payment/${order.id}?loanId=${loanId}`
                });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to generate payment link', message: error.message });
        }
    }
}
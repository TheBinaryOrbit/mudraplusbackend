import { AdminService } from "../services/admin.service.js";
import { hashPassword } from "../utils/password.utils.js";
import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";
import { EventService } from "../services/event.service.js";
import { LoanService } from "../services/loan.service.js";

export class AdminController {
    constructor() {
        this.adminService = new AdminService();
        this.authService = new AuthService();
        this.userService = new UserService();
        this.eventService = new EventService();
        this.loanService = new LoanService();
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
        if (admin.role !== 'admin') {
            return res.status(403).json({ error: 'Only superadmin can access all admins' });
        }
        try {
            const admins = await this.adminService.getAllAdmins();
            res.status(200).json(admins);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to retrieve admins', message: error.message });
        }
    }

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

        try {
            const users = admin.role === 'admin' ?
                await this.userService.getAllUsers() :
                await this.userService.getUsersByAgentId(admin.id);

            if(admin.role !== 'admin'){
                const filteredUsers = users.map(user => {
                    return user.user;
                });
                return  res.status(200).json({ users: filteredUsers });
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


            const user = await this.userService.getSpecficUser(userId , field);

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
}
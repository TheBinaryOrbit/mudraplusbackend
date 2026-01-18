import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";
import { EventService } from "../services/event.service.js";
import { AdminService } from "../services/admin.service.js";

export class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
        this.eventService = new EventService();
        this.adminService = new AdminService();
    }

    login = async (req, res) => {
        const userData = req.body;
        try {
            if((!userData.email && !userData.password) || !userData.phone) {
                const errors = [];
                if (!userData.email && !userData.phone) errors.push({ field: "useridentity", message: "Email or phone is required" });
                if (!userData.password) errors.push({ field: "password", message: "Password is required" });
                return res.status(400).json({ message : 'All fields are required', errors });
            }

            const user = userData.email ? await this.userService.getUserByEmail(userData.email) : await this.userService.getUserByPhone(userData.phone);

            if (!user) {
                return res.status(404).json({ message : 'User not found' });
            }

            const isPasswordValid = await this.authService.verifypassword(userData.password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message : 'Invalid password' });
            }

            const token = this.authService.generateToken({ id: user.id, email: user.email, phone: user.phone , name: user.name });
            const userResponse = {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone
            }

            // Send login notification event
            await this.eventService.createEvent(user.id, 'notification', {
                title: 'Login Successful',
                message: `You have successfully logged in on ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`
            });
            
            res.status(200).json(
                { user: userResponse, token }
            );
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Login failed', message: 'Internal server error' });
        }
    }


    logout = async (req, res) => {
        const user = req.user; // from auth middleware
        await this.eventService.createEvent(user.id, 'notification', {
                title: 'Logout Successful',
                message: `You have successfully logged out on ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`
        });
        res.status(200).json({ message: 'Logout successful' });
    }


    adminLogin = async (req, res) => {
        const adminData = req.body;
        try {
            if ((!adminData.email || !adminData.password)) {
                const errors = [];
                if (!adminData.email) errors.push({ field: "email", message: "Email is required" });
                if (!adminData.password) errors.push({ field: "password", message: "Password is required" });
                return res.status(400).json({ message: 'All fields are required', errors });
            }
            const admin = await this.adminService.getAdminByEmail(adminData.email);

            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            const isPasswordValid = await this.authService.verifypassword(adminData.password, admin.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            const token = this.authService.generateToken({ id: admin.id, email: admin.email, role: admin.role, name: admin.name });
            const adminResponse = {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
            res.status(200).json(
                { admin: adminResponse, token }
            );
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Admin login failed', message: 'Internal server error' });
        }
    }
}
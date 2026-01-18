import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";
import { EventService } from "../services/event.service.js";

export class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
        this.eventService = new EventService();
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

}
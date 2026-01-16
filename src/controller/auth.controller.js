import { AuthService } from "../services/auth.service.js";
import { UserService } from "../services/user.service.js";

export class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
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

            const token = this.authService.generateToken(user);
            const userResponse = {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone
            }
            res.status(200).json(
                { user: userResponse, token }
            );
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Login failed', message: 'Internal server error' });
        }
    }


    logout = async (req, res) => {
        // For JWT, logout can be handled on the client side by deleting the token.
        // Optionally, you can implement token blacklisting on the server side.
        const user = req.user; // from auth middleware
        console.log(`User ${user.id} logged out.`);
        res.status(200).json({ message: 'Logout successful' });
    }

}
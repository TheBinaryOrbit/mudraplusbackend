
import { verifyToken as verify } from '../utils/jwt.utils.js';

export class AuthMiddleware {
    
    verifyToken = (req, res, next) => {
        // 1. Get token from header (Format: Bearer <token>)
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        try {
            const verified = verify(token);
            req.user = verified;
            next();
        } catch (error) {
            // If token is expired or fake
            res.status(403).json({ message: "Invalid or expired token" });
        }
    }
}
import { generateToken } from '../utils/jwt.utils.js';
import { comparePassword } from '../utils/password.utils.js';

export class AuthService {
    generateToken(user) {
        const token = generateToken(user);
        return token;
    }

    verifypassword(plainPassword, hashedPassword) {
        return comparePassword(plainPassword, hashedPassword);
    }
}
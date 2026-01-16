import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn:  process.env.JWT_EXPIRES_IN || '7D' });
    return token;
}


export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
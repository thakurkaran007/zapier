import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

interface JwtPayload {
  id: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.access_token;
    console.log('cookies: \n', req.cookies);
    if (!token) {
        console.error('No token provided');
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!payload || !payload.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        //@ts-ignore    
        req.id = payload.id; // Type-safe now
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

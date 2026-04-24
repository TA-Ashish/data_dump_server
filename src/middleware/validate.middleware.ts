import { Request, Response, NextFunction } from 'express';

export function requireUserId(req: Request, res: Response, next: NextFunction): void {
    const userId = req.headers['x-user-id'];

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        res.status(400).json({
            success: false,
            error: 'Missing or invalid required header: x-user-id',
        });
        return;
    }

    res.locals.userId = userId.trim();
    next();
}

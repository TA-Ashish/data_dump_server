import { Request, Response } from 'express';
import { Dump } from '../models/dump.model';

export async function storeDump(req: Request, res: Response): Promise<void> {
    const userId = res.locals.userId as string;
    const payload = req.body as Record<string, unknown>;

    const doc = await Dump.create({ userId, payload });

    res.status(201).json({
        success: true,
        data: {
            id: doc.id,
            userId: doc.userId,
            createdAt: doc.createdAt,
        },
    });
}

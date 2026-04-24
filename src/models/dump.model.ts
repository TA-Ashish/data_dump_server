import { Schema, model, Document } from 'mongoose';
import type { DumpDocument } from '../types/dump.types';

export type DumpDocumentModel = DumpDocument & Document;

const dumpSchema = new Schema<DumpDocumentModel>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        payload: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const Dump = model<DumpDocumentModel>('Dump', dumpSchema);

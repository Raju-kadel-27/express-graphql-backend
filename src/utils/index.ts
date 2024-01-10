import type { ZodError } from "zod";
import { AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import { Request } from 'express';

/**
 * Flattens a Zod error object into a simple error string.
 * @returns e.g. "Invite Code is in an invalid format"
 * or if it fails, a standard "Validation error" message is returned
 */

export const zodErrorToString = (err: ZodError) => {
    try {
        return Object.entries((err as ZodError).flatten().fieldErrors)
            .reduce((acc, [field, errorMessages]) => {
                errorMessages?.forEach((msg) =>
                    acc.push(`${camelCaseToSentenceCase(field)} ${msg}`)
                );
                return acc;
            }, [] as string[])
            .join(", ");
    } catch (err) {
        return "Validation error";
    }
};


export const camelCaseToSentenceCase = (str: string) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());




export const authenticateUser = (req: Request): { sub: string } => {
    console.log(req.headers, "req.headers");
    const token = req.headers.authorization || '';
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
        return decoded;
    } catch (error) {
        throw new AuthenticationError('Invalid or missing token');
    }
};
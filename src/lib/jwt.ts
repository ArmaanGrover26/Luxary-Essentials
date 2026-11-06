import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
    userId: string;
    email: string;
    role: "user" | "admin";
}

export function signToken(payload: TokenPayload): string {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);
}

export function verifyToken(token: string): TokenPayload & JwtPayload {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    return jwt.verify(token, JWT_SECRET) as TokenPayload & JwtPayload;
}

export interface PendingRegistrationPayload {
    name: string;
    email: string;
    passwordHash: string;
    otpHash: string;
    purpose: "pending_registration";
}

export function signPendingRegistrationToken(
    payload: Omit<PendingRegistrationPayload, "purpose">
): string {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    return jwt.sign(
        { ...payload, purpose: "pending_registration" },
        JWT_SECRET,
        { expiresIn: "10m" } as SignOptions
    );
}

export function verifyPendingRegistrationToken(
    token: string
): PendingRegistrationPayload & JwtPayload {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, JWT_SECRET) as PendingRegistrationPayload & JwtPayload;
    if (decoded.purpose !== "pending_registration") {
        throw new Error("Invalid token purpose");
    }
    return decoded;
}

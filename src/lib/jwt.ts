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

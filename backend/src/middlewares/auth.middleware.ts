import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../services/jwt.service";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Accès refusé" });
    }
    next();
  });
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
}

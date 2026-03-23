import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { RegisterSchema, LoginSchema } from "../validators/auth.validator";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

const ACCESS_COOKIE_OPTIONS  = { ...COOKIE_BASE, maxAge: 15 * 60 * 1000 };
const REFRESH_COOKIE_OPTIONS = { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 * 1000 };

export async function register(req: AuthRequest, res: Response) {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  try {
    const user = await AuthService.registerUser(parsed.data);
    return res.status(201).json({ user });
  } catch (e: any) {
    if (e.message === "EMAIL_TAKEN") return res.status(409).json({ message: "Email déjà utilisé" });
    if (e.message === "PHONE_TAKEN") return res.status(409).json({ message: "Numéro de téléphone déjà utilisé" });
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

  try {
    const { accessToken, refreshToken, user } = await AuthService.loginUser(parsed.data.email, parsed.data.password);
    res.cookie("accessToken",  accessToken,  ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    return res.json({ user,accessToken });
  } catch (e: any) {
    if (e.message === "INVALID_CREDENTIALS") return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "Refresh token manquant" });

  try {
    const { accessToken } = await AuthService.refreshAccessToken(token);
    return res.json({ accessToken });
  } catch {
    res.clearCookie("refreshToken");
    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.json({ message: "Déconnecté avec succès" });
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await AuthService.getProfile(req.user!.sub);
    return res.json({ user });
  } catch {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }
}

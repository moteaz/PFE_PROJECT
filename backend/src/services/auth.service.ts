import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { JwtPayload, signAccessToken, signRefreshToken, verifyRefreshToken } from "./jwt.service";

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] },
    select: { email: true, phone: true },
  });
  if (existing?.email === data.email) throw new Error("EMAIL_TAKEN");
  if (existing?.phone === data.phone) throw new Error("PHONE_TAKEN");

  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role ?? "CLIENT",
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new Error("INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  const payload: JwtPayload = { sub: user.id, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) throw new Error("USER_NOT_FOUND");

  const payload: JwtPayload = { sub: user.id, role: user.role };
  return { accessToken: signAccessToken(payload) };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
  });
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}

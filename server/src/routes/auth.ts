import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import type { User } from "../types/user";

const router = Router();

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

// Temporary in-memory users.
// Replace with database-backed users before deployment.
const users: (User & { passwordHash: string })[] = [];

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid login details" });
  }

  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    return res.status(500).json({
      error: "Authentication is not configured securely",
    });
  }

  const user = users.find(
    (candidate) => candidate.email === result.data.email
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(
    result.data.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: "1h",
    }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export default router;

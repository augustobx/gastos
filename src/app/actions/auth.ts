"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres").regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function registerUser(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: parsed.data.username.toLowerCase() },
  });

  if (existingUser) {
    return { error: "Ese nombre de usuario ya está en uso" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      username: parsed.data.username.toLowerCase(),
      name: parsed.data.name,
      password: hashedPassword,
    },
  });

  await createSession(user.id, user.username, user.name);
  redirect("/");
}

const loginSchema = z.object({
  username: z.string().min(1, "Ingresá tu usuario"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export async function loginUser(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { username: parsed.data.username.toLowerCase() },
  });

  if (!user) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  const isMatch = await bcrypt.compare(parsed.data.password, user.password);

  if (!isMatch) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  await createSession(user.id, user.username, user.name);
  redirect("/");
}

export async function logoutUser() {
  await deleteSession();
  redirect("/login");
}

import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z.string().min(1, { error: "La contraseña es requerida" }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
      .max(50, { error: "El nombre no puede superar 50 caracteres" })
      .trim(),
    username: z
      .string()
      .min(3, { error: "El usuario debe tener al menos 3 caracteres" })
      .max(20, { error: "El usuario no puede superar 20 caracteres" })
      .regex(/^[a-z0-9_]+$/, {
        error: "Solo letras minúsculas, números y guiones bajos",
      })
      .trim(),
    email: z.email({ error: "Email inválido" }),
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/[A-Z]/, { error: "Debe contener al menos una mayúscula" })
      .regex(/[0-9]/, { error: "Debe contener al menos un número" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const phoneVerifySchema = z.object({
  code: z
    .string()
    .length(6, { error: "El código debe tener 6 dígitos" })
    .regex(/^\d+$/, { error: "Solo dígitos" }),
});

export const createPartySchema = z.object({
  name: z
    .string()
    .min(3, { error: "El nombre debe tener al menos 3 caracteres" })
    .max(50, { error: "El nombre no puede superar 50 caracteres" })
    .trim(),
  description: z
    .string()
    .max(300, { error: "La descripción no puede superar 300 caracteres" })
    .optional(),
  game: z.enum(["MINECRAFT", "PROJECT_ZOMBOID"], {
    error: "Selecciona un juego",
  }),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"], {
    error: "Selecciona un nivel",
  }),
  minPlayers: z.number().int().min(2).max(6),
  maxPlayers: z.number().int().min(2).max(6),
  language: z.string().min(2).max(5),
  modded: z.boolean(),
  modTags: z.array(z.string().max(50)).max(10).optional(),
  modsNote: z.string().max(200).optional(),
  serverInfo: z.string().max(200).optional(),
  selectedRules: z.array(z.string()),
  customRules: z.array(
    z.object({
      category: z.enum(["BEHAVIOR", "GAMEPLAY", "COMMUNICATION", "CUSTOM"]),
      text: z.string().min(5).max(200),
    })
  ),
});

export const gameProfileSchema = z.object({
  game: z.enum(["MINECRAFT", "PROJECT_ZOMBOID"]),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  playtimeHours: z.number().int().min(0).max(99999).optional(),
  modded: z.boolean(),
  modsNote: z.string().max(200).optional(),
  minecraftStyle: z
    .enum(["SURVIVAL", "HARDCORE", "CREATIVE", "ADVENTURE"])
    .optional(),
  pzStyle: z.enum(["CASUAL", "ROLEPLAY", "HARDCORE", "CHALLENGE"]).optional(),
  notes: z.string().max(300).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type GameProfileInput = z.infer<typeof gameProfileSchema>;

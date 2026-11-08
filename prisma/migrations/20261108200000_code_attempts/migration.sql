-- Límite de intentos en los códigos de verificación (solo añade columnas)
ALTER TABLE "EmailVerification" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PhoneVerification" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

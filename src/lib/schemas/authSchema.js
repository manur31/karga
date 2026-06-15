import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

//faltaba el confirm
export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Formato de email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
})
//.refine para la verif
.refine((datos) => datos.password === datos.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

//para el onboarding
export const onboardingSchema = z.object({
  weeklyFrequency: z.number().min(1).max(7),
  restTime: z.number().min(30),
  weight: z.coerce
    .number({ invalid_type_error: "Ingresá un número válido" })
    .positive("El peso debe ser mayor a 0")
    .max(800, "Ingresá un peso real"),
});
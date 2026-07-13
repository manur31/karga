import { z } from 'zod'

export const routineSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'El nombre no puede superar los 50 caracteres'),
    description: z.string().min(1, 'Description is required').max(200, 'La descripción no puede superar los 200 caracteres'),
})

export const routineFormSchema = routineSchema.extend({
    exercises: z.array(z.string()).min(1, 'At least one exercise is required'),
})
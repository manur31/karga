import { z } from 'zod'

export const routineSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
})

export const routineFormSchema = routineSchema.extend({
    exercises: z.array(z.string()).min(1, 'At least one exercise is required'),
})
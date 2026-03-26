import { z } from "zod"

const onlyDigits = (value: string) => value.replace(/\D/g, "")

export const formularioSchema = z.object({
  nome: z.string().trim().min(3, "Nome precisa ter pelo menos 3 caracteres."),
  cpf: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? onlyDigits(value) : undefined))
    .refine((value) => value === undefined || value.length === 11, {
      message: "CPF deve ter 11 dígitos ou ficar em branco.",
    }),
  cidade: z.string().trim().min(2, "Cidade é obrigatória."),
  fazenda: z.string().trim().min(2, "Fazenda é obrigatória."),
  telefone: z
    .string()
    .trim()
    .transform((value) => onlyDigits(value))
    .refine((value) => value.length >= 10 && value.length <= 11, {
      message: "Telefone deve ter 10 ou 11 dígitos com DDD.",
    }),
})

export type FormularioInput = z.infer<typeof formularioSchema>

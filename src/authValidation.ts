import z from "zod";

export const authSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(10, "Username must be at most 10 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "Must contain at least one special character (@$!%*?&)"
    ),
});

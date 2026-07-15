import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  role: z.enum(["Founder", "Sales", "Ops", "Investor Relations", "Other"]),
  company_name: z.string().min(1, "Company name is required").max(100),
  timezone: z.string().min(1, "Timezone is required"),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const notificationPrefsSchema = z.object({
  notify_task_due: z.boolean(),
  notify_deal_changes: z.boolean(),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(150),
  website: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^https?:\/\//.test(val) || !val.includes("://"),
      "Website must be a valid URL"
    ),
  industry: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["Prospect", "Active", "Inactive"]),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  company_id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().max(100).optional().or(z.literal("")),
  linkedin_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required").max(150),
  company_id: z.string().uuid().optional().or(z.literal("")),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  stage: z.enum(["Lead", "Qualified", "Demo", "Proposal", "Won", "Lost"]),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  currency: z.string().min(1).max(10),
  expected_close_date: z.string().optional().or(z.literal("")),
  probability: z.coerce.number().min(0).max(100),
  status: z.enum(["Open", "Closed Won", "Closed Lost"]),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "note", "task", "other"]),
  subject: z.string().min(1, "Subject is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  related_entity_type: z.enum(["contact", "company", "deal"]),
  related_entity_id: z.string().uuid("Select a related record"),
  due_at: z.string().optional().or(z.literal("")),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  related_entity_type: z.enum(["contact", "company", "deal"]).optional().or(z.literal("")),
  related_entity_id: z.string().uuid().optional().or(z.literal("")),
  due_at: z.string().optional().or(z.literal("")),
  priority: z.enum(["Low", "Medium", "High"]),
  completed: z.boolean().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type TaskInput = z.infer<typeof taskSchema>;

import { z } from "zod";

export const formSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  location: z.tuple([z.string().optional(), z.string().optional()]).optional(),
  wechat: z.string().optional(),
  website: z.string().optional(),
  skills: z.array(z.string()).optional(),
  workExperiences: z.array(
    z.object({
      company: z.string().optional(),
      position: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      description: z.string().optional(),
      keyAchievements: z.string().optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      school: z.string().optional(),
      degree: z.string().optional(),
      major: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    })
  ).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

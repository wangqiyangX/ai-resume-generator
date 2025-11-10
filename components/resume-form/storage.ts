import { FormValues } from "./types";

export const STORAGE_KEY = "resume-form-data";

// Helper function to serialize form data for localStorage
export function serializeFormData(data: FormValues): string {
  const serialized = {
    ...data,
    workExperiences: data.workExperiences?.map((exp) => ({
      ...exp,
      startDate: exp.startDate?.toISOString(),
      endDate: exp.endDate?.toISOString(),
    })),
    education: data.education?.map((edu) => ({
      ...edu,
      startDate: edu.startDate?.toISOString(),
      endDate: edu.endDate?.toISOString(),
    })),
  };
  return JSON.stringify(serialized);
}

// Helper function to deserialize form data from localStorage
export function deserializeFormData(json: string): Partial<FormValues> | null {
  try {
    const parsed = JSON.parse(json) as {
      workExperiences?: Array<{
        company?: string;
        position?: string;
        startDate?: string;
        endDate?: string;
        description?: string;
        keyAchievements?: string;
      }>;
      education?: Array<{
        school?: string;
        degree?: string;
        major?: string;
        startDate?: string;
        endDate?: string;
      }>;
      [key: string]: unknown;
    };
    return {
      ...parsed,
      workExperiences: parsed.workExperiences?.map((exp) => ({
        ...exp,
        company: exp.company || "",
        position: exp.position || "",
        description: exp.description || "",
        keyAchievements: exp.keyAchievements || "",
        startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
        endDate: exp.endDate ? new Date(exp.endDate) : new Date(),
      })),
      education: parsed.education?.map((edu) => ({
        ...edu,
        school: edu.school || "",
        degree: edu.degree || "",
        major: edu.major || "",
        startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
        endDate: edu.endDate ? new Date(edu.endDate) : new Date(),
      })),
    };
  } catch (error) {
    console.error("Failed to deserialize form data:", error);
    return null;
  }
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Form } from "@/components/ui/form";
import ResumePreview, { ResumeData } from "./resume-preview";
import { formSchema, FormValues } from "./resume-form/types";
import {
  STORAGE_KEY,
  serializeFormData,
  deserializeFormData,
} from "./resume-form/storage";
import { PersonalInfoSection } from "./resume-form/personal-info-section";
import { WorkExperienceSection } from "./resume-form/work-experience-section";
import { EducationSection } from "./resume-form/education-section";
import { SkillsSection } from "./resume-form/skills-section";

export default function ResumeForm() {
  // Initialize stateName from localStorage
  const getInitialStateName = (): string => {
    if (typeof window === "undefined") return "";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const deserialized = deserializeFormData(saved);
      return deserialized?.location?.[1] || "";
    }
    return "";
  };

  const [stateName, setStateName] = useState<string>(getInitialStateName);
  const [mounted, setMounted] = useState(false);
  const isInitializedRef = useRef(false);
  const hasShownRestoreToastRef = useRef(false);
  const debounceSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);
  const formValuesRef = useRef<FormValues | null>(null);

  // Always use fixed default values to prevent hydration errors
  const getDefaultValues = (): Partial<FormValues> => {
    return {
      fullName: "",
      email: "",
      wechat: "",
      phoneNumber: "",
      location: ["", ""],
      website: "",
      skills: [],
      workExperiences: [
        {
          company: "",
          position: "",
          startDate: new Date(),
          endDate: new Date(),
          description: "",
          keyAchievements: "",
        },
      ],
      education: [
        {
          school: "",
          degree: "",
          major: "",
          startDate: new Date(),
          endDate: new Date(),
        },
      ],
    };
  };

  const defaultValues = getDefaultValues();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Prevent hydration errors with dnd-kit
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Load saved data from localStorage after mount to prevent hydration errors
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const deserialized = deserializeFormData(saved);
      if (deserialized) {
        // Check if there's meaningful data to restore
        const hasData =
          deserialized.fullName ||
          deserialized.email ||
          deserialized.phoneNumber ||
          (deserialized.workExperiences &&
            deserialized.workExperiences.length > 0 &&
            (deserialized.workExperiences[0]?.company ||
              deserialized.workExperiences[0]?.position)) ||
          (deserialized.education &&
            deserialized.education.length > 0 &&
            (deserialized.education[0]?.school ||
              deserialized.education[0]?.degree));

        if (hasData) {
          // Reset form with saved data
          form.reset(deserialized as FormValues);

          // Show restore toast after a short delay
          if (!hasShownRestoreToastRef.current) {
            setTimeout(() => {
              toast.success("表单数据已自动恢复");
              hasShownRestoreToastRef.current = true;
            }, 500);
          }
        }
      }
    }
  }, [mounted, form]);

  // Mark as initialized and set initial saved data reference
  useEffect(() => {
    isInitializedRef.current = true;
    // Set initial saved data to prevent showing save toast on first load
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        lastSavedDataRef.current = saved;
      }
    }
  }, []);

  // Watch form values and save to localStorage
  const formValues = useWatch({
    control: form.control,
  });

  // Update formValues ref whenever it changes
  useEffect(() => {
    if (formValues) {
      formValuesRef.current = formValues as FormValues;
    }
  }, [formValues]);

  // Save function with toast
  const saveFormData = useCallback((showToast = false) => {
    if (typeof window === "undefined" || !formValuesRef.current) return;

    try {
      const currentValues = formValuesRef.current;
      const serialized = serializeFormData(currentValues);

      // Only save if data actually changed
      const hasChanged = lastSavedDataRef.current !== serialized;

      if (hasChanged) {
        localStorage.setItem(STORAGE_KEY, serialized);
        lastSavedDataRef.current = serialized;

        if (showToast) {
          toast.success("数据已自动保存", {
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error("Failed to save form data to localStorage:", error);
      if (showToast) {
        toast.error("保存失败", {
          description: "无法保存表单数据到本地存储",
        });
      }
    }
  }, []);

  // Debounced auto-save when form values change
  useEffect(() => {
    if (!mounted || !isInitializedRef.current) return;

    // Clear existing debounce timer
    if (debounceSaveTimerRef.current) {
      clearTimeout(debounceSaveTimerRef.current);
    }

    // Set up new debounce timer (3 seconds after last change)
    debounceSaveTimerRef.current = setTimeout(() => {
      saveFormData(true);
    }, 3000);

    return () => {
      if (debounceSaveTimerRef.current) {
        clearTimeout(debounceSaveTimerRef.current);
      }
    };
  }, [formValues, mounted, saveFormData]);

  // Intercept Command+S / Ctrl+S for manual save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command+S (Mac) or Ctrl+S (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        saveFormData(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [saveFormData]);

  const workExperienceFieldArray = useFieldArray({
    control: form.control,
    name: "workExperiences",
  });

  const educationFieldArray = useFieldArray({
    control: form.control,
    name: "education",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Watch form values for real-time preview
  const watchedData = useWatch({
    control: form.control,
  }) as ResumeData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-10">
      {/* Form Section */}
      <div className="space-y-4">
        <Form {...form}>
          <div className="space-y-4">
            <PersonalInfoSection
              form={form}
              stateName={stateName}
              setStateName={setStateName}
            />

            <SkillsSection form={form} />

            <WorkExperienceSection
              form={form}
              fieldArray={workExperienceFieldArray}
              sensors={sensors}
              mounted={mounted}
            />

            <EducationSection
              form={form}
              fieldArray={educationFieldArray}
              sensors={sensors}
              mounted={mounted}
            />
          </div>
        </Form>
      </div>

      {/* Preview Section */}
      <div className="lg:sticky lg:top-8 h-fit">
        <ResumePreview data={watchedData} />
      </div>
    </div>
  );
}

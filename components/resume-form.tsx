"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import LocationSelector from "@/components/ui/location-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  location: z.tuple([z.string().min(1), z.string().optional()]),
  wechat: z.string().optional(),
  workExperiences: z.array(
    z.object({
      company: z.string().min(1),
      position: z.string().min(1),
      startDate: z.date(),
      endDate: z.date(),
      description: z.string(),
      keyAchievements: z.string(),
    })
  ),
  education: z.array(
    z.object({
      school: z.string().min(1),
      degree: z.string().min(1),
      major: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

const STORAGE_KEY = "resume-form-data";

// Helper function to serialize form data for localStorage
function serializeFormData(data: FormValues): string {
  const serialized = {
    ...data,
    workExperiences: data.workExperiences.map((exp) => ({
      ...exp,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate.toISOString(),
    })),
    education: data.education.map((edu) => ({
      ...edu,
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate.toISOString(),
    })),
  };
  return JSON.stringify(serialized);
}

// Helper function to deserialize form data from localStorage
function deserializeFormData(json: string): Partial<FormValues> | null {
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

interface SortableWorkExperienceItemProps {
  id: string;
  index: number;
  form: ReturnType<typeof useForm<FormValues>>;
  onRemove: () => void;
}

interface SortableEducationItemProps {
  id: string;
  index: number;
  form: ReturnType<typeof useForm<FormValues>>;
  onRemove: () => void;
}

function SortableWorkExperienceItem({
  id,
  index,
  form,
  onRemove,
}: SortableWorkExperienceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4 space-y-2 gap-2">
      <div className="flex justify-between items-center py-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
          <span className="sr-only">Draggable</span>
        </Button>
        <h4 className="font-bold">{`Work ${index + 1}`}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
        >
          <X className="size-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      <FormField<FormValues>
        control={form.control}
        name={`workExperiences.${index}.company`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company</FormLabel>
            <FormControl>
              <Input
                placeholder="Inc."
                type="text"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField<FormValues>
        control={form.control}
        name={`workExperiences.${index}.position`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl>
              <Input
                placeholder="Job Title"
                type="text"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between gap-2">
        <FormField<FormValues>
          control={form.control}
          name={`workExperiences.${index}.startDate`}
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<FormValues>
          control={form.control}
          name={`workExperiences.${index}.endDate`}
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name={`workExperiences.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Your role and responsibilities..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`workExperiences.${index}.keyAchievements`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Key Achievements</FormLabel>
            <FormControl>
              <Textarea placeholder="- Increased scales by 20%" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
}

function SortableEducationItem({
  id,
  index,
  form,
  onRemove,
}: SortableEducationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4 space-y-2 gap-2">
      <div className="flex justify-between items-center py-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
          <span className="sr-only">Draggable</span>
        </Button>
        <h4 className="font-bold">{`Education ${index + 1}`}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
        >
          <X className="size-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      <FormField<FormValues>
        control={form.control}
        name={`education.${index}.school`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>School</FormLabel>
            <FormControl>
              <Input
                placeholder="University Name"
                type="text"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField<FormValues>
        control={form.control}
        name={`education.${index}.degree`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Degree</FormLabel>
            <FormControl>
              <Input
                placeholder="Bachelor"
                type="text"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField<FormValues>
        control={form.control}
        name={`education.${index}.major`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Major</FormLabel>
            <FormControl>
              <Input
                placeholder="Computer Science"
                type="text"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between gap-2">
        <FormField<FormValues>
          control={form.control}
          name={`education.${index}.startDate`}
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<FormValues>
          control={form.control}
          name={`education.${index}.endDate`}
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value as Date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value as Date | undefined}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}

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
  const isInitializedRef = useRef(false);
  const hasShownRestoreToastRef = useRef(false);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);
  const formValuesRef = useRef<FormValues | null>(null);

  // Load saved data from localStorage
  const getDefaultValues = (): Partial<FormValues> => {
    if (typeof window === "undefined") {
      return {};
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const deserialized = deserializeFormData(saved);
      if (deserialized) {
        return deserialized;
      }
    }

    return {
      fullName: "",
      email: "",
      wechat: "",
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

  // Show restore toast if data was restored
  useEffect(() => {
    if (typeof window === "undefined" || hasShownRestoreToastRef.current) {
      return;
    }

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
          // Show restore toast after a short delay to ensure UI is ready
          setTimeout(() => {
            toast.success("表单数据已自动恢复");
            hasShownRestoreToastRef.current = true;
          }, 500);
        }
      }
    }
  }, []);

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

  // Manual save function
  const handleManualSave = useCallback(() => {
    if (typeof window === "undefined" || !formValuesRef.current) return;

    try {
      const currentValues = formValuesRef.current;
      const serialized = serializeFormData(currentValues);

      localStorage.setItem(STORAGE_KEY, serialized);
      lastSavedDataRef.current = serialized;

      // Check if there's meaningful data to save
      const hasData =
        currentValues.fullName ||
        currentValues.email ||
        currentValues.phoneNumber ||
        (currentValues.workExperiences &&
          currentValues.workExperiences.length > 0 &&
          (currentValues.workExperiences[0]?.company ||
            currentValues.workExperiences[0]?.position)) ||
        (currentValues.education &&
          currentValues.education.length > 0 &&
          (currentValues.education[0]?.school ||
            currentValues.education[0]?.degree));

      if (hasData) {
        toast.success("数据已保存");
      } else {
        toast.info("表单为空", {
          description: "没有数据需要保存",
        });
      }
    } catch (error) {
      console.error("Failed to save form data to localStorage:", error);
      toast.error("保存失败", {
        description: "无法保存表单数据到本地存储",
      });
    }
  }, []);

  // Auto-save form data to localStorage every 60 seconds
  useEffect(() => {
    if (!isInitializedRef.current) return;

    // Clear existing interval if any
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    // Set up interval to save every 60 seconds
    saveIntervalRef.current = setInterval(() => {
      if (typeof window === "undefined" || !formValuesRef.current) return;

      try {
        const currentValues = formValuesRef.current;
        const serialized = serializeFormData(currentValues);

        // Only save and show toast if data actually changed
        const hasChanged = lastSavedDataRef.current !== serialized;

        if (hasChanged) {
          localStorage.setItem(STORAGE_KEY, serialized);
          lastSavedDataRef.current = serialized;

          // Check if there's meaningful data to save
          const hasData =
            currentValues.fullName ||
            currentValues.email ||
            currentValues.phoneNumber ||
            (currentValues.workExperiences &&
              currentValues.workExperiences.length > 0 &&
              (currentValues.workExperiences[0]?.company ||
                currentValues.workExperiences[0]?.position)) ||
            (currentValues.education &&
              currentValues.education.length > 0 &&
              (currentValues.education[0]?.school ||
                currentValues.education[0]?.degree));

          if (hasData) {
            toast.success("数据已自动保存");
          }
        }
      } catch (error) {
        console.error("Failed to save form data to localStorage:", error);
        toast.error("保存失败", {
          description: "无法保存表单数据到本地存储",
        });
      }
    }, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []); // Only run once on mount

  // Intercept Command+S / Ctrl+S for manual save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command+S (Mac) or Ctrl+S (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleManualSave]);

  const {
    fields: workExperienceFields,
    append: appendWorkExperience,
    remove: removeWorkExperience,
    move: moveWorkExperience,
  } = useFieldArray({
    control: form.control,
    name: "workExperiences",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
    move: moveEducation,
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleWorkExperienceDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = workExperienceFields.findIndex(
        (field) => field.id === active.id
      );
      const newIndex = workExperienceFields.findIndex(
        (field) => field.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        moveWorkExperience(oldIndex, newIndex);
      }
    }
  }

  function handleEducationDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = educationFields.findIndex(
        (field) => field.id === active.id
      );
      const newIndex = educationFields.findIndex(
        (field) => field.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        moveEducation(oldIndex, newIndex);
      }
    }
  }

  function onSubmit(values: FormValues) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mx-auto py-10"
      >
        <Card className="p-4 space-y-2 gap-2">
          <div className="flex justify-between gap-2">
            <FormField<FormValues>
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      type="text"
                      value={field.value as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField<FormValues>
              control={form.control}
              name="wechat"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>WeChat</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="shadcn"
                      type="text"
                      value={(field.value as string) || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between gap-2">
            <FormField<FormValues>
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@mail.com"
                      type="email"
                      value={field.value as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField<FormValues>
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full">
                  <FormLabel>Phone</FormLabel>
                  <FormControl className="w-full">
                    <PhoneInput
                      placeholder="Placeholder"
                      value={field.value as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      defaultCountry="CN"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField<FormValues>
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <LocationSelector
                      value={field.value as [string, string | undefined]}
                      onCountryChange={(country) => {
                        form.setValue(field.name, [
                          country?.name || "",
                          stateName || "",
                        ]);
                      }}
                      onStateChange={(state) => {
                        setStateName(state?.name || "");
                        const currentValue = form.getValues(field.name) as
                          | [string, string | undefined]
                          | undefined;
                        form.setValue(field.name, [
                          currentValue?.[0] || "",
                          state?.name || "",
                        ]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Work Experiences</h3>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                appendWorkExperience({
                  company: "",
                  position: "",
                  startDate: new Date(),
                  endDate: new Date(),
                  description: "",
                  keyAchievements: "",
                })
              }
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add WorkExperience</span>
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleWorkExperienceDragEnd}
          >
            <SortableContext
              items={workExperienceFields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {workExperienceFields.map((field, index) => (
                <SortableWorkExperienceItem
                  key={field.id}
                  id={field.id}
                  index={index}
                  form={form}
                  onRemove={() => removeWorkExperience(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education</h3>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                appendEducation({
                  school: "",
                  degree: "",
                  major: "",
                  startDate: new Date(),
                  endDate: new Date(),
                })
              }
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Education</span>
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleEducationDragEnd}
          >
            <SortableContext
              items={educationFields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {educationFields.map((field, index) => (
                <SortableEducationItem
                  key={field.id}
                  id={field.id}
                  index={index}
                  form={form}
                  onRemove={() => removeEducation(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

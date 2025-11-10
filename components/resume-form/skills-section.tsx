"use client";

import { useState, KeyboardEvent } from "react";
import { UseFormReturn } from "react-hook-form";
import { X } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FormValues } from "./types";

interface SkillsSectionProps {
  form: UseFormReturn<FormValues>;
}

export function SkillsSection({ form }: SkillsSectionProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const trimmedValue = inputValue.trim();
      if (!trimmedValue) return;

      const currentSkills = form.getValues("skills") || [];

      // Avoid duplicates
      if (currentSkills.includes(trimmedValue)) {
        setInputValue("");
        return;
      }

      form.setValue("skills", [...currentSkills, trimmedValue]);
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const skills = form.watch("skills") || [];

  return (
    <Card className="p-4 space-y-2 gap-2">
      <FormField<FormValues>
        control={form.control}
        name="skills"
        render={() => (
          <FormItem>
            <FormLabel>Skills</FormLabel>
            <FormControl>
              <Input
                placeholder="Type a skill and press Enter (e.g., React, TypeScript)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-sm py-1 px-3 pr-1 gap-1"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="size-4" color="gray" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

import { UseFormReturn, UseFieldArrayReturn } from "react-hook-form";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormValues } from "./types";
import { SortableEducationItem } from "./sortable-education-item";

interface EducationSectionProps {
  form: UseFormReturn<FormValues>;
  fieldArray: UseFieldArrayReturn<FormValues, "education", "id">;
  sensors: ReturnType<typeof import("@dnd-kit/core").useSensors>;
  mounted: boolean;
}

export function EducationSection({
  form,
  fieldArray,
  sensors,
  mounted,
}: EducationSectionProps) {
  const { fields, append, remove, move } = fieldArray;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        move(oldIndex, newIndex);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Education</h3>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() =>
            append({
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

      {!mounted ? (
        // Render without DndContext on server to prevent hydration errors
        <div className="space-y-4">
          {fields.map((field, index) => (
            <SortableEducationItem
              key={field.id}
              id={field.id}
              index={index}
              form={form}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableEducationItem
                key={field.id}
                id={field.id}
                index={index}
                form={form}
                onRemove={() => remove(index)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

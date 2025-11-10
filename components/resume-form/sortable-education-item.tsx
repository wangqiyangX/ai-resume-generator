import { UseFormReturn } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { X, GripVertical, CalendarIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { FormValues } from "./types";

interface SortableEducationItemProps {
  id: string;
  index: number;
  form: UseFormReturn<FormValues>;
  onRemove: () => void;
}

export function SortableEducationItem({
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

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
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
                        "w-full text-left font-normal justify-start",
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
                        "w-full text-left font-normal justify-start",
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

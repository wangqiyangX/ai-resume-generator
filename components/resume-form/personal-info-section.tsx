import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import LocationSelector from "@/components/ui/location-input";
import { Card } from "@/components/ui/card";
import { FormValues } from "./types";

interface PersonalInfoSectionProps {
  form: UseFormReturn<FormValues>;
  stateName: string;
  setStateName: (name: string) => void;
}

export function PersonalInfoSection({
  form,
  stateName,
  setStateName,
}: PersonalInfoSectionProps) {
  return (
    <Card className="p-4 space-y-2 gap-2">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
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

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
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

      <div>
        <FormField<FormValues>
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  type="url"
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
    </Card>
  );
}

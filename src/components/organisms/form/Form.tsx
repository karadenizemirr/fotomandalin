"use client";

import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormProvider from "./FormProvider";

interface FormProps<T extends z.ZodType<any, any, any>> {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  resetOnSubmit?: boolean;
}

/**
 * Form bileşeni, react-hook-form ve zod validasyonu ile form oluşturmayı kolaylaştırır.
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
 *   email: z.string().email("Geçerli bir e-posta adresi giriniz"),
 * });
 *
 * <Form schema={schema} onSubmit={handleSubmit}>
 *   <TextField name="name" label="İsim" required />
 *   <EmailField name="email" label="E-posta" required />
 *   <button type="submit">Gönder</button>
 * </Form>
 * ```
 */
export default function Form<T extends z.ZodType<any, any, any>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className = "",
  resetOnSubmit = false,
}: FormProps<T>) {
  type FormData = z.infer<T>;

  const methods = useForm<FormData>({
    resolver: zodResolver(schema) as any, // Type assertion to fix resolver compatibility
    defaultValues: defaultValues as any,
    mode: "onTouched",
  });

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      if (resetOnSubmit) {
        methods.reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      // Form hata durumunu handle etmek için burada error state eklenebilir
    }
  };

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit}
      className={className}
    >
      {children}
    </FormProvider>
  );
}

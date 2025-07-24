"use client";

import {
  FormProvider as HookFormProvider,
  UseFormReturn,
} from "react-hook-form";

interface FormProviderProps {
  children: React.ReactNode;
  methods: UseFormReturn<any>;
  onSubmit: (data: any) => void | Promise<void>; // Make onSubmit required and support async
  className?: string;
}

/**
 * FormProvider bileşeni, react-hook-form için bir wrapper sağlar.
 * Form state'ini ve metodlarını alt bileşenlere aktarır.
 */
export default function FormProvider({
  children,
  methods,
  onSubmit,
  className = "",
}: FormProviderProps) {
  const handleFormSubmit = async (data: any) => {
    console.log("DEBUG: Form submitting with data:", data);
    console.log("DEBUG: Form errors:", methods.formState.errors);
    console.log("DEBUG: Form isValid:", methods.formState.isValid);

    try {
      await onSubmit(data);
    } catch (error) {
      console.error("DEBUG: Form submission error:", error);
    }
  };

  return (
    <HookFormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </HookFormProvider>
  );
}

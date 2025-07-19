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
  return (
    <HookFormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </HookFormProvider>
  );
}

"use client";

import { useFormContext } from "react-hook-form";

interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: React.ReactNode;
}

export default function FormCheckbox({
  name,
  label,
  className = "",
  ...props
}: FormCheckboxProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={name}
          type="checkbox"
          className={`focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded ${className}`}
          {...register(name)}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={name} className="text-gray-600">
          {label}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error.message as string}</p>
        )}
      </div>
    </div>
  );
}

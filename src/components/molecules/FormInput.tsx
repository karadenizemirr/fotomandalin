"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/atoms/input";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  required?: boolean;
}

export default function FormInput({
  name,
  label,
  required = false,
  type = "text",
  className = "",
  ...props
}: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && "*"}
      </label>
      <div className="mt-1">
        <Input
          id={name}
          type={type}
          className={`${className} ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : ""
          }`}
          {...register(name)}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message as string}</p>
      )}
    </div>
  );
}

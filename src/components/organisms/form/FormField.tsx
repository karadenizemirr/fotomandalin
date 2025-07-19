"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Eye, EyeOff, Calendar, Clock } from "lucide-react";

// Input Props
interface InputProps {
  name: string;
  label: any;
  type?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  options?: { label: string; value: string | number }[];
  rows?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  onChange?: (value: string) => void;
}

// Error Message Component
const ErrorMessage = ({ message }: { message: string }) => {
  return message ? (
    <p className="mt-1 text-xs text-red-500">{message}</p>
  ) : null;
};

// Helper Text Component
const HelperText = ({ text }: { text?: string }) => {
  return text ? <p className="mt-1 text-xs text-gray-500">{text}</p> : null;
};

// Label Component
const Label = ({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Text Input Component
export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  helperText,
  disabled = false,
  required = false,
  className = "",
  onChange,
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name]?.message as string | undefined;

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine input type for password fields
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <div className="relative">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 border text-sm ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
            disabled ? "bg-gray-100 text-gray-400" : "bg-white"
          }`}
          {...register(name, {
            onChange: (e) => {
              onChange?.(e.target.value);
            },
          })}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Textarea Component
export function TextareaField({
  name,
  label,
  placeholder,
  helperText,
  disabled = false,
  required = false,
  rows = 4,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 border text-sm ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
          disabled ? "bg-gray-100 text-gray-400" : "bg-white"
        }`}
        {...register(name)}
      />
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Select Component
export function SelectField({
  name,
  label,
  options = [],
  placeholder = "Seçiniz",
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <select
        id={name}
        disabled={disabled}
        className={`w-full px-4 py-2 border text-sm ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
          disabled ? "bg-gray-100 text-gray-400" : "bg-white"
        }`}
        {...register(name)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Checkbox Component
export function CheckboxField({
  name,
  label,
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={name}
          type="checkbox"
          disabled={disabled}
          className={`h-4 w-4 text-amber-500 border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded focus:ring-amber-500 ${
            disabled ? "bg-gray-100" : "bg-white"
          }`}
          {...register(name)}
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor={name}
          className={`font-medium ${
            disabled ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <HelperText text={helperText} />
        <ErrorMessage message={error || ""} />
      </div>
    </div>
  );
}

// Radio Group Component
export function RadioGroupField({
  name,
  label,
  options = [],
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <div className="mt-1 space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              type="radio"
              value={option.value}
              disabled={disabled}
              className={`h-4 w-4 text-amber-500 border ${
                error ? "border-red-500" : "border-gray-200"
              } focus:ring-amber-500 ${disabled ? "bg-gray-100" : "bg-white"}`}
              {...register(name)}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={`ml-3 block text-sm font-medium ${
                disabled ? "text-gray-400" : "text-gray-700"
              }`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Date Input Component
export function DateField({
  name,
  label,
  helperText,
  disabled = false,
  required = false,
  className = "",
  min,
  max,
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <div className="relative">
        <input
          id={name}
          type="date"
          min={min as string}
          max={max as string}
          disabled={disabled}
          className={`w-full px-4 py-2 border text-sm ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
            disabled ? "bg-gray-100 text-gray-400" : "bg-white"
          }`}
          {...register(name)}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
      </div>
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Time Input Component
export function TimeField({
  name,
  label,
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <div className="relative">
        <input
          id={name}
          type="time"
          disabled={disabled}
          className={`w-full px-4 py-2 border text-sm ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
            disabled ? "bg-gray-100 text-gray-400" : "bg-white"
          }`}
          {...register(name)}
        />
        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
      </div>
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Number Input Component
export function NumberField({
  name,
  label,
  placeholder,
  helperText,
  disabled = false,
  required = false,
  className = "",
  min,
  max,
  step,
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <input
        id={name}
        type="number"
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full px-4 py-2 border text-sm ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
          disabled ? "bg-gray-100 text-gray-400" : "bg-white"
        }`}
        {...register(name)}
      />
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// File Input Component
export function FileField({
  name,
  label,
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value: _value, ...field } }) => (
          <div className="mt-1 flex items-center">
            <input
              id={name}
              type="file"
              disabled={disabled}
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium ${
                disabled
                  ? "file:bg-gray-100 file:text-gray-400"
                  : "file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              } ${error ? "border-red-500" : ""}`}
              {...field}
            />
          </div>
        )}
      />
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Switch/Toggle Component
export function SwitchField({
  name,
  label,
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <span
          className={`text-sm font-medium ${
            disabled ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        <HelperText text={helperText} />
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <button
            type="button"
            role="switch"
            aria-checked={!!value}
            disabled={disabled}
            onClick={() => onChange(!value)}
            className={`${
              value ? "bg-amber-500" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            {...field}
          >
            <span
              className={`${
                value ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        )}
      />
      <ErrorMessage message={error || ""} />
    </div>
  );
}

// Phone Input Component
export function PhoneField({
  name,
  label,
  placeholder = "(___) ___ __ __",
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
          +90
        </span>
        <input
          id={name}
          type="tel"
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 border text-sm ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-r-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
            disabled ? "bg-gray-100 text-gray-400" : "bg-white"
          }`}
          {...register(name)}
        />
      </div>
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

// Email Input Component
export function EmailField({
  name,
  label,
  placeholder,
  helperText,
  disabled = false,
  required = false,
  className = "",
}: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className={`w-full ${className}`}>
      <Label htmlFor={name} label={label} required={required} />
      <input
        id={name}
        type="email"
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 border text-sm ${
          error ? "border-red-500" : "border-gray-200"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
          disabled ? "bg-gray-100 text-gray-400" : "bg-white"
        }`}
        {...register(name)}
      />
      <ErrorMessage message={error || ""} />
      <HelperText text={helperText} />
    </div>
  );
}

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const spinnerVariants = cva("animate-spin", {
  variants: {
    color: {
      default: "text-black",
      primary: "text-amber-500",
      secondary: "text-white",
    },
    size: {
      default: "h-8 w-8",
      sm: "h-4 w-4",
      lg: "h-12 w-12",
      icon: "h-6 w-6",
    },
  },
  defaultVariants: {
    color: "default",
    size: "default",
  },
});

export interface SpinnerProps
  extends Omit<React.SVGProps<SVGSVGElement>, "color">,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, color, size, ...props }, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(spinnerVariants({ color, size, className }))}
        ref={ref}
        {...props}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    );
  }
);

Spinner.displayName = "Spinner";

export { Spinner };

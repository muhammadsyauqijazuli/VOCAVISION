import { cva, VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const buttonVariants = cva(
  "hover:bg-opacity-90 inline-flex items-center justify-center gap-2.5 text-center font-medium transition focus:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        green: "bg-green text-white",
        dark: "bg-dark text-white dark:bg-white/10",
        outlinePrimary:
          "border border-primary text-primary hover:bg-primary/10",
        outlineGreen: "border border-green text-green hover:bg-green/10",
        outlineDark:
          "border border-dark text-dark hover:bg-dark/10 dark:border-white/25 dark:text-white dark:hover:bg-white/10",
      },
      shape: {
        default: "",
        rounded: "rounded-[5px]",
        full: "rounded-full",
      },
      size: {
        default: "px-10 py-3.5 lg:px-8 xl:px-10",
        small: "px-6 py-[11px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "default",
      size: "default",
    },
  },
);

type ButtonProps = HTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    label: string;
    icon?: React.ReactNode;
  };

export function Button({
  label,
  icon,
  variant,
  shape,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, shape, size, className })}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

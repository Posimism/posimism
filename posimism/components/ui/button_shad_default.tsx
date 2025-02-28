import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, joinClassNames } from "@/utils/tailwind-utils";
import { ImSpinner2 } from "react-icons/im";

const buttonVariants = cva(
  joinClassNames(
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "whitespace-nowrap",
    "rounded-lg",
    "text-sm",
    "font-medium",
    "transition-colors",
    "focus-visible:outline-hidden",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "cursor-pointer",
    "disabled:cursor-not-allowed",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "&_svg:pointer-events-none",
    "&_svg:size-4",
    "&_svg:shrink-0",
    "dark:outline-offset-lace-950",
    "outline-offset-lace-200"
  ),
  {
    variants: {
      variant: {
        default: "text-lace dark:text-lace-950",
        secondary: "",
        destructive:
          "bg-pink-500 hover:bg-pink-500/90 dark:bg-pink-800 dark:hover:bg-pink-800/90",
        outline: "border-1.5",
        ghost: "",
        link: "underline-offset-4",
      },
      size: {
        xs: "rounded-lg p-1",
        default: "h-8 sm:h-10 px-4 py-2",
        sm: "h-7 sm:h-9 rounded-lg px-3",
        lg: "h-9 sm:h-11 rounded-lg px-8",
        icon: "h-8 sm:h-10 w-8 sm:w-10",
      },
      colorClass: {
        bismark:
          "focus-visible:outline-bismark-400 dark:focus-visible:outline-bismark-300",
      },
      modal: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "destructive",
        colorClass: ["bismark"],
        class:
          "focus-visible:outline-pink-400 dark:focus-visible:outline-pink-300",
      },
      {
        variant: "default",
        modal: true,
        class: "dark:text-lace-200",
      },
      {
        variant: "default",
        colorClass: "bismark",
        class:
          "bg-bismark-900 hover:bg-bismark-900/90 dark:bg-bismark-400 dark:hover:bg-bismark-400/90",
      },
      {
        variant: "default",
        colorClass: "bismark",
        modal: true,
        class:
          "bg-bismark-900 hover:bg-bismark-900/90 dark:bg-bismark-800 dark:hover:bg-bismark-700/90",
      },
      {
        variant: "secondary",
        colorClass: "bismark",
        class:
          "bg-bismark-700 hover:bg-bismark-700/90 dark:bg-bismark-700 dark:hover:bg-bismark-700/90",
      },
      {
        variant: "outline",
        colorClass: "bismark",
        class:
          "border-bismark-700 hover:bg-bismark-300 dark:bg-bismark-950 dark:hover:bg-bismark-800 dark:hover:",
      },
      {
        variant: "ghost",
        colorClass: "bismark",
        class:
          "hover:bg-bismark-100 hover:dark:hover:bg-bismark-800 dark:hover:",
      },
      {
        variant: "link",
        colorClass: "bismark",
        class: "underline-offset-4 ",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      colorClass: "bismark",
      modal: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      colorClass,
      size,
      children,
      modal,
      disabled,
      asChild = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, colorClass, modal, className })
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? <ImSpinner2 className="animate-spin" /> : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

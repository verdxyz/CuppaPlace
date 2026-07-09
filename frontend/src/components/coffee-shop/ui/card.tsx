// src/components/coffee-shop/ui/card.tsx
import * as React from "react";

// Ganti empty interface → type alias agar lolos rule @typescript-eslint/no-empty-object-type
export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={["rounded-2xl border border-neutral-200 bg-white shadow-sm", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={["px-4 py-3 border-b border-neutral-200", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={["px-4 py-3", className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={["px-4 py-3 border-t border-neutral-200", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);

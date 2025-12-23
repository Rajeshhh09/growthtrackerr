import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border text-card-foreground",
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        glass: "bg-card/50 backdrop-blur-xl border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
        glassHover: "bg-card/50 backdrop-blur-xl border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_40px_hsla(187,100%,42%,0.1),inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5",
        stat: "bg-card/50 backdrop-blur-xl border-border/50 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        statPrimary: "bg-card/50 backdrop-blur-xl border-primary/20 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_60px_hsla(187,100%,42%,0.08)]",
        statSuccess: "bg-card/50 backdrop-blur-xl border-success/20 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_60px_hsla(142,76%,36%,0.08)]",
        statWarning: "bg-card/50 backdrop-blur-xl border-warning/20 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_60px_hsla(38,92%,50%,0.08)]",
        statAccent: "bg-card/50 backdrop-blur-xl border-accent/20 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_60px_hsla(280,100%,60%,0.08)]",
      },
    },
    defaultVariants: {
      variant: "glass",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

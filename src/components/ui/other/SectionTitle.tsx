import { colors, ColorType } from "@/types/component";
import { cn } from "@/utils/helpers";
import { tv } from "tailwind-variants";

export interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: ColorType;
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  classNames?: {
    container?: string;
    indicator?: string;
    title?: string;
  };
}

const title = tv({
  base: "font-bold leading-tight tracking-tight",
  variants: {
    size: {
      h1: "text-3xl sm:text-4xl md:text-5xl",
      h2: "text-2xl sm:text-3xl md:text-4xl",
      h3: "text-xl sm:text-2xl md:text-3xl",
      h4: "text-lg sm:text-xl md:text-2xl",
      h5: "text-base sm:text-lg md:text-xl",
      h6: "text-sm sm:text-base md:text-lg",
    },
  },
  defaultVariants: {
    size: "h5",
  },
});

const indicator = tv({
  base: "rounded-full flex-shrink-0",
  variants: {
    size: {
      h1: "h-12 w-2 sm:h-14 sm:w-2.5 md:h-16 md:w-3",
      h2: "h-10 w-2 sm:h-12 sm:w-2.5 md:h-14 md:w-3",
      h3: "h-8 w-1.5 sm:h-10 sm:w-2 md:h-12 md:w-2.5",
      h4: "h-7 w-1.5 sm:h-8 sm:w-2 md:h-10 md:w-2.5",
      h5: "h-6 w-1.5 sm:h-7 sm:w-2 md:h-8 md:w-2",
      h6: "h-5 w-1 sm:h-6 sm:w-1.5 md:h-6 md:w-2",
    },
  },
  defaultVariants: {
    size: "h5",
  },
});

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  color = "primary",
  size,
  className,
  classNames,
  ...props
}) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-1 sm:gap-2.5 sm:px-0 md:gap-3", 
        classNames?.container, 
        className
      )} 
      {...props}
    >
      <div className={cn(indicator({ size }), colors({ color }), classNames?.indicator)} />
      <h1 className={cn(title({ size }), classNames?.title)}>{children}</h1>
    </div>
  );
};

export default SectionTitle;

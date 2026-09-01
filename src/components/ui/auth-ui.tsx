"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { InteractiveCharacter } from "@/components/ui/interactive-character";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
    textArray.length,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border/80 dark:border-border/60 bg-background/50 hover:bg-accent hover:text-accent-foreground shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border/90 dark:border-border/70 bg-card/60 dark:bg-card/40 px-3.5 py-2 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground/70 hover:border-border focus-visible:border-foreground/40 dark:focus-visible:border-foreground/50 focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onFocusChange?: (focused: boolean) => void;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, onFocusChange, onFocus, onBlur, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            className={cn("pe-10", className)}
            onFocus={(e) => {
              onFocusChange?.(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              onFocusChange?.(false);
              onBlur?.(e);
            }}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

interface FormProps {
  onPasswordFocusChange: (focused: boolean) => void;
}

function SignInForm({ onPasswordFocusChange }: FormProps) {
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("UI: Sign In form submitted");
  };
  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to sign in
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="Password"
          onFocusChange={onPasswordFocusChange}
        />
        <Button type="submit" variant="default" className="mt-2 h-10 w-full font-medium">
          Sign In
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({ onPasswordFocusChange }: FormProps) {
  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("UI: Sign Up form submitted");
  };
  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to sign up
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          placeholder="Password"
          onFocusChange={onPasswordFocusChange}
        />
        <Button type="submit" variant="default" className="mt-2 h-10 w-full font-medium">
          Sign Up
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  onPasswordFocusChange,
}: {
  isSignIn: boolean;
  onToggle: () => void;
  onPasswordFocusChange: (focused: boolean) => void;
}) {
  return (
    <div className="w-full max-w-[400px] rounded-2xl border border-border/80 dark:border-border/60 bg-card/60 dark:bg-card/40 p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col gap-6">
        {isSignIn ? (
          <SignInForm onPasswordFocusChange={onPasswordFocusChange} />
        ) : (
          <SignUpForm onPasswordFocusChange={onPasswordFocusChange} />
        )}

        <div className="text-center text-sm">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <Button variant="link" className="pl-1 text-foreground font-semibold" onClick={onToggle}>
            {isSignIn ? "Sign up" : "Sign in"}
          </Button>
        </div>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border/80">
          <span className="relative z-10 bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Or continue with
          </span>
        </div>

        <Button
          variant="outline"
          type="button"
          className="h-10 w-full"
          onClick={() => console.log("UI: Google button clicked")}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google icon"
            className="mr-2 h-4 w-4"
          />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

interface AuthContentProps {
  quote?: {
    text: string;
    author: string;
  };
}

interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
}

const defaultSignInContent = {
  quote: {
    text: "Welcome Back! The journey continues.",
    author: "HireMind AI",
  },
};

const defaultSignUpContent = {
  quote: {
    text: "Create an account. A new chapter awaits.",
    author: "HireMind AI",
  },
};

export function AuthUI({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* LEFT SIDE: Interactive Character with Moving Eye & Typewriter Quote */}
      <div className="relative flex flex-col items-center justify-center p-6 md:p-12 bg-muted/20 dark:bg-card/30 border-b md:border-b-0 md:border-r border-border/50 transition-colors duration-500 overflow-hidden min-h-[380px] md:min-h-screen">
        {/* Ambient radial glow */}
        <div className="absolute w-72 h-72 rounded-full bg-amber-400/10 dark:bg-yellow-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-sm">
          {/* Character with animated eye following cursor */}
          <InteractiveCharacter isPasswordFocused={isPasswordFocused} />

          {/* Quote Section */}
          <blockquote className="space-y-2 text-center text-foreground">
            <p className="text-lg font-medium">
              “
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />
              ”
            </p>
            <cite className="block text-sm font-light text-muted-foreground not-italic">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form Box */}
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-10 min-h-[500px] md:min-h-screen">
        <AuthFormContainer
          isSignIn={isSignIn}
          onToggle={toggleForm}
          onPasswordFocusChange={setIsPasswordFocused}
        />
      </div>
    </div>
  );
}

const DemoOne = () => {
  return <AuthUI />;
};

export { DemoOne };

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, className].join(" ").trim();

  return (
    <button
      {...props}
      className={classes}
      style={{
        ...(fullWidth ? { width: "100%" } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
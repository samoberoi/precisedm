import { ReactNode } from "react";

interface WebContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

const WebContainer = ({ children, className = "", narrow = false }: WebContainerProps) => {
  return (
    <div className={`mx-auto w-full ${narrow ? "max-w-2xl" : "max-w-6xl"} md:px-6 ${className}`}>
      {children}
    </div>
  );
};

export default WebContainer;

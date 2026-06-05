import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PropsType = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ShowcaseSection({ title, children, className }: PropsType) {
  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <h2 className="border-b border-stroke px-4 py-4 font-medium text-dark sm:px-6 xl:px-7.5 dark:border-dark-3 dark:text-white">
        {title}
      </h2>

      <div className={cn("p-4 sm:p-6 xl:p-10", className)}>{children}</div>
    </div>
  );
}

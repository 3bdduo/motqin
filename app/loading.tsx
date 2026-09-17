import { LogoSpinner } from "@/components/LogoSpinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center py-12 animate-fade-in">
      <LogoSpinner size="lg" text="جاري التحميل..." />
    </div>
  );
}

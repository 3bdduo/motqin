import { LogoSpinner } from "@/components/LogoSpinner";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center py-12 animate-fade-in">
      <LogoSpinner size="lg" text="جاري تحميل لوحة التحكم..." />
    </div>
  );
}

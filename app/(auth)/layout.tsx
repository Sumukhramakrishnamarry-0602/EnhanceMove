export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            E
          </div>
          <span className="text-lg font-semibold tracking-tight">EnhanceMove</span>
        </div>
        {children}
      </div>
    </div>
  );
}

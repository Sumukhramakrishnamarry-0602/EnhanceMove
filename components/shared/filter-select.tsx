"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function FilterSelect({
  paramKey,
  placeholder,
  options,
}: {
  paramKey: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "all";

  const onChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") params.delete(paramKey);
    else params.set(paramKey, val);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

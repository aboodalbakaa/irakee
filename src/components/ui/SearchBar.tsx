"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  className?: string;
}

export function SearchBar({
  placeholder,
  value,
  onChange,
  onSearch,
  showFilters,
  onToggleFilters,
  className,
}: SearchBarProps) {
  const t = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value ?? "");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex w-full max-w-2xl items-center gap-2",
        className
      )}
    >
      <div className="relative flex-1">
        <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder ?? t("home.searchPlaceholder")}
          className="h-12 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      {onToggleFilters && (
        <Button
          type="button"
          variant={showFilters ? "primary" : "outline"}
          size="icon"
          onClick={onToggleFilters}
          aria-label={t("common.toggleFilters")}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
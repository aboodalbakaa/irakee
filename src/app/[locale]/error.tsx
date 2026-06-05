"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-stone-900">
          {t("error")}
        </h2>
        <p className="max-w-md text-sm text-stone-500">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button
          variant="primary"
          onClick={reset}
        >
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
import { Suspense } from "react";
import { SearchContent } from "@/components/search-content";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchContent />
    </Suspense>
  );
}
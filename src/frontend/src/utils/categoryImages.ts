/**
 * Returns a category-appropriate Unsplash fallback image URL for civic reports.
 * Used when no user-uploaded photo is available.
 */
export function getCategoryFallbackImage(category: string): string {
  const map: Record<string, string> = {
    // Road damage, pothole, broken infrastructure
    infrastructure:
      "https://images.unsplash.com/photo-1565117131035-9bc7e51e9f99?w=400&q=60",
    // Garbage, waste, open dump
    sanitation:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=60",
    // Dark street, unsafe area, broken light
    publicSafety:
      "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=400&q=60",
    // Hospital, ambulance, medical
    healthcare:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&q=60",
    // Legal, government, bribery
    corruption:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=60",
    // Generic city issue
    other:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=60",
  };
  // Strip IssueCategory enum noise like braces
  const key = category.replace(/[{}]/g, "").trim();
  return map[key] ?? map.other;
}

/**
 * Returns the best display image for a report:
 * 1. User-uploaded photo (highest priority)
 * 2. Category-matched fallback
 */
export function getReportDisplayImage(
  localMediaUrl: string | undefined,
  category: string,
): string {
  if (localMediaUrl) return localMediaUrl;
  return getCategoryFallbackImage(category);
}

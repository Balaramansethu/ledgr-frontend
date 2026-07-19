import { CATEGORIES, toCategoryKey, type CustomCategoryDto } from '@ledgr/shared';

export interface CategoryVisual {
  name: string;
  icon: string; // lucide name
  color: string; // hex
}

/**
 * Resolve the label/icon/color for an expense — ports CategoryRegistry.resolve*.
 * A custom category (by key) wins; otherwise the built-in category is used.
 */
export function resolveCategory(
  category: string,
  customKey: string | null | undefined,
  customCategories: CustomCategoryDto[],
): CategoryVisual {
  if (customKey) {
    const custom = customCategories.find((c) => c.key === customKey);
    if (custom) return { name: custom.name, icon: custom.icon, color: custom.color };
  }
  const def = CATEGORIES[toCategoryKey(category)];
  return { name: def.displayName, icon: def.icon, color: def.color };
}

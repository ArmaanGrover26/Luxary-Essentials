/**
 * Canonical category configuration for Luxury Essentials.
 *
 * FIXED ORDER: The 8 new categories appear first (in the specified order).
 * All legacy categories follow deterministically.
 */

export interface CategoryConfig {
    value: string;
    label: string;
}

/** Categories shown in the fixed display order (primary 8 first, legacy after). */
export const ORDERED_CATEGORIES: CategoryConfig[] = [
    { value: "resin-art-pigments",  label: "Resin Art Pigments" },
    { value: "silicon-moulds",       label: "Silicon Moulds" },
    { value: "charms-and-pearls",    label: "Charms and Pearls" },
    { value: "accessories",          label: "Accessories" },
    { value: "essentials",           label: "Essentials" },
    { value: "candle-moulds",        label: "Candle Moulds" },
    { value: "candle-essentials",    label: "Candle Essentials" },
    { value: "raw-material",         label: "Raw Material" },
    // Legacy categories preserved
    { value: "resin",                label: "Resin Art" },
    { value: "candles",              label: "Candles" },
    { value: "raw-materials",        label: "Raw Materials" },
    { value: "gifts",                label: "Luxury Gifts" },
];

/** All category values (for enum checks). */
export const ALL_CATEGORY_VALUES = ORDERED_CATEGORIES.map((c) => c.value);

/** Get the human-readable label for a category value. */
export function getCategoryLabel(value: string): string {
    const found = ORDERED_CATEGORIES.find((c) => c.value === value);
    return found ? found.label : value.replace(/-/g, " ");
}

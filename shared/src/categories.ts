/**
 * Built-in expense categories — ported from `lib/models/expense.dart`.
 * Material `IconData` becomes a lucide-react icon *name* (a string the web
 * renders via a name→component map); colors keep their exact hex values.
 */
export type CategoryKey =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'entertainment'
  | 'travel'
  | 'other';

export interface CategoryDef {
  key: CategoryKey;
  displayName: string;
  /** lucide-react icon name */
  icon: string;
  /** hex color, matches the Flutter Color() values */
  color: string;
  keywords: string[];
}

export const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  food: {
    key: 'food',
    displayName: 'Food',
    icon: 'utensils',
    color: '#EF6C00',
    keywords: [
      'grocery', 'groceries', 'restaurant', 'coffee', 'lunch', 'dinner',
      'breakfast', 'snack', 'pizza', 'burger', 'food', 'eat', 'meal',
      'drink', 'tea', 'juice', 'starbucks', 'mcdonald', 'takeout',
    ],
  },
  transport: {
    key: 'transport',
    displayName: 'Transport',
    icon: 'car',
    color: '#1565C0',
    keywords: [
      'uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'metro', 'subway',
      'gas', 'fuel', 'petrol', 'parking', 'toll', 'ride', 'commute',
    ],
  },
  shopping: {
    key: 'shopping',
    displayName: 'Shopping',
    icon: 'shopping-bag',
    color: '#7B1FA2',
    keywords: [
      'clothes', 'clothing', 'shoes', 'amazon', 'store', 'mall', 'shirt',
      'pants', 'jacket', 'dress', 'online', 'order', 'bought', 'purchase',
    ],
  },
  bills: {
    key: 'bills',
    displayName: 'Bills',
    icon: 'receipt-text',
    color: '#00838F',
    keywords: [
      'rent', 'electricity', 'electric', 'water', 'internet', 'wifi',
      'phone', 'insurance', 'bill', 'subscription', 'netflix', 'spotify',
      'utility', 'utilities', 'mortgage',
    ],
  },
  health: {
    key: 'health',
    displayName: 'Health',
    icon: 'heart',
    color: '#C62828',
    keywords: [
      'doctor', 'pharmacy', 'medicine', 'gym', 'hospital', 'dentist',
      'prescription', 'health', 'medical', 'therapy', 'vitamin',
    ],
  },
  entertainment: {
    key: 'entertainment',
    displayName: 'Entertainment',
    icon: 'film',
    color: '#AD1457',
    keywords: [
      'movie', 'cinema', 'concert', 'game', 'bar', 'drinks', 'party',
      'club', 'ticket', 'show', 'theater', 'museum', 'fun', 'event',
    ],
  },
  travel: {
    key: 'travel',
    displayName: 'Travel',
    icon: 'plane',
    color: '#2E7D32',
    keywords: [
      'hotel', 'flight', 'airbnb', 'booking', 'hostel', 'vacation',
      'trip', 'travel', 'airport', 'luggage', 'resort',
    ],
  },
  other: {
    key: 'other',
    displayName: 'Other',
    icon: 'ellipsis',
    color: '#546E7A',
    keywords: [],
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export function isCategoryKey(value: string): value is CategoryKey {
  return value in CATEGORIES;
}

/** Coerce an arbitrary stored string into a valid category, defaulting to `other`. */
export function toCategoryKey(value: string | null | undefined): CategoryKey {
  return value && isCategoryKey(value) ? value : 'other';
}

/**
 * Keyword-based categorizer — ported from `ExpenseParser.categorize`
 * (`lib/services/expense_parser.dart`). Used on import and as an optional
 * assist when the user types a note. Word-boundary matched, first hit wins.
 */
export function categorize(description: string): CategoryKey {
  const lower = description.toLowerCase();
  for (const key of CATEGORY_KEYS) {
    if (key === 'other') continue;
    for (const keyword of CATEGORIES[key].keywords) {
      const re = new RegExp(`\\b${keyword}\\b`);
      if (re.test(lower)) return key;
    }
  }
  return 'other';
}

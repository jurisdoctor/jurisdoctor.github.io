export interface CategoryType {
  slug: string;
  name: string;
  note?: string;
  words: string[];
}

export const CATEGORIES: CategoryType[] = [
  {
    slug: "medicine-cabinet",
    name: "Medicine Cabinet",
    words: [
      "Vicks VapoRub",
      "ginger tea",
      "cough syrup",
      "honey and lemon",
      "tiger balm",
      "Salonpas",
    ],
  },
  {
    slug: "filipino-food",
    name: "Filipino Food",
    words: [
      "lumpia",
      "mango",
      "lechon (roast pig)",
      "noodles",
      "fried chicken",
      "shaved iced (dessert)",
    ],
  },
  {
    slug: "traditions-values",
    name: "Traditions & Values",
    words: [
      "Christmas",
      "Church",
      "Wedding",
      "Baptism",
      "Rosary",
      "Godparents",
    ],
  },
  {
    slug: "common-health-problems",
    name: "Common Health Problems",
    words: [
      "Diabetes",
      "Asthma",
      "Headache",
      "Back Pain",
      "Flu",
      "Hypertension",
    ],
  },
  {
    slug: "culture",
    name: "Culture",
    note: "most common hobbies, most watched sport, things to do",
    words: [
      "karaoke",
      "taking off shoes (at the door)",
      "eating with your hands",
      "basketball",
      "boxing",
      "bamboo dance",
    ],
  },
];

export const categoryOf = (slug: string | null | undefined) =>
  CATEGORIES.find((entry) => entry.slug === slug);

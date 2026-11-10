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
      "Salonpas",
      "ginger tea",
      "cough syrup",
      "honey and lemon",
      "tiger balm",
    ],
  },
  {
    slug: "filipino-food",
    name: "Filipino Food",
    words: [
      "mango",
      "lechon (roast pig)",
      "noodles",
      "fried chicken",
      "shaved iced (dessert)",
      "rice at every meal",
    ],
  },
  {
    slug: "traditions-values",
    name: "Traditions & Values",
    words: [
      "Pray before meals",
      "Respecting elders",
      "Christmas",
      "Big family party",
      "Wedding",
      "Going to church",
    ],
  },
  {
    slug: "common-health-problems",
    name: "Common Health Problems",
    words: [
      "Diabetes",
      "Asthma",
      "Headache",
      "Back pain",
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

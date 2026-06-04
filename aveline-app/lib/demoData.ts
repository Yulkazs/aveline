/**
 * DEMO_DATA.ts
 * Centrale dummy data voor alle presentatie-schermen.
 * Gebruikt door PresentatieDashboard.tsx — geen API calls nodig.
 *
 * Structuur:
 *  - DEMO_PRODUCTS        → CatalogusClient, NieuweBestellingClient
 *  - DEMO_ORDERS          → BestellingenClient, BestelDetail, AnalyticsClient
 *  - DEMO_COMPLAINTS      → KlachtenClient
 *  - DEMO_CHAT_SESSIONS_B2C → ChatOverzichtB2C
 *  - DEMO_CHAT_SESSIONS_CS  → ChatOverzichtCS
 *  - DEMO_COMMUNITY_POSTS   → CommunityFeed
 *  - DEMO_PROMOTIONS        → PromotiesClient
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Geeft een ISO-string terug die `daysAgo` dagen in het verleden ligt. */
function daysAgo(days: number, hoursOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
}

/** Geeft een ISO-string terug die `daysFromNow` dagen in de toekomst ligt. */
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const DEMO_PRODUCTS = [
  {
    id: "demo-prod-1",
    name: "Avéline Noir 85%",
    description:
      "Een intense, volle pure chocolade met tonen van gedroogd fruit en een lichte rooksmaak. Gemaakt van single-origin cacao uit Ghana.",
    cacaoPercentage: 85,
    origin: "Ghana",
    ingredients: ["Cacaomassa", "Suiker", "Cacaoboter", "Vanille"],
    allergens: ["Melk", "Gluten"],
    certifications: ["Fairtrade", "Rainforest Alliance"],
    batchNumber: "GH-2024-0312",
    isLimitedEdition: false,
    isPremium: true,
    imageUrl: null,
    category: "Puur",
  },
  {
    id: "demo-prod-2",
    name: "Avéline Lait Caramel",
    description:
      "Romige melkchocolade met stukjes gekarameliseerde zeezout. Perfect als cadeau of voor bij de koffie.",
    cacaoPercentage: 42,
    origin: "Ecuador",
    ingredients: ["Cacaomassa", "Volle melkpoeder", "Suiker", "Cacaoboter", "Zeezout", "Karamel"],
    allergens: ["Melk", "Soja"],
    certifications: ["UTZ Certified"],
    batchNumber: "EC-2024-0189",
    isLimitedEdition: false,
    isPremium: false,
    imageUrl: null,
    category: "Melk",
  },
  {
    id: "demo-prod-3",
    name: "Avéline Blanc Framboise",
    description:
      "Witte chocolade met gevriesdroogde frambozen. Limited edition zomercollectie met een friszure toets.",
    cacaoPercentage: 30,
    origin: "Ivoorkust",
    ingredients: ["Cacaoboter", "Suiker", "Volle melkpoeder", "Gevriesdroogde framboos", "Vanille"],
    allergens: ["Melk"],
    certifications: ["Bio", "Fairtrade"],
    batchNumber: "CI-2024-0445",
    isLimitedEdition: true,
    isPremium: true,
    imageUrl: null,
    category: "Wit",
  },
  {
    id: "demo-prod-4",
    name: "Avéline Noir 70% Origin",
    description:
      "Klassieke pure chocolade met een uitgebalanceerd profiel. Geschikt voor patisserie en dagelijks genieten.",
    cacaoPercentage: 70,
    origin: "Peru",
    ingredients: ["Cacaomassa", "Suiker", "Cacaoboter", "Sojalecithine", "Vanille"],
    allergens: ["Soja"],
    certifications: ["Rainforest Alliance"],
    batchNumber: "PE-2024-0271",
    isLimitedEdition: false,
    isPremium: false,
    imageUrl: null,
    category: "Puur",
  },
];

// ─── Orders ───────────────────────────────────────────────────────────────────
// Zowel BestellingenClient (met items.product.imageUrl/batchNumber) als
// AnalyticsClient (items.product.id/name) gebruiken dit formaat.

export const DEMO_ORDERS = [
  {
    id: "demo-order-1",
    orderNumber: "AVL-2024-00341",
    status: "DELIVERED" as const,
    deliveryAddress: "Keizersgracht 123, 1015 CJ Amsterdam",
    expectedDelivery: daysAgo(3),
    totalAmount: "312.50",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(3),
    items: [
      {
        id: "demo-oi-1a",
        quantity: 10,
        unitPrice: "18.75",
        product: {
          id: "demo-prod-1",
          name: "Avéline Noir 85%",
          batchNumber: "GH-2024-0312",
          imageUrl: null,
        },
      },
      {
        id: "demo-oi-1b",
        quantity: 7,
        unitPrice: "12.50",
        product: {
          id: "demo-prod-4",
          name: "Avéline Noir 70% Origin",
          batchNumber: "PE-2024-0271",
          imageUrl: null,
        },
      },
    ],
  },
  {
    id: "demo-order-2",
    orderNumber: "AVL-2024-00389",
    status: "SHIPPED" as const,
    deliveryAddress: "Herengracht 56, 1015 BN Amsterdam",
    expectedDelivery: daysFromNow(2),
    totalAmount: "225.00",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    items: [
      {
        id: "demo-oi-2a",
        quantity: 12,
        unitPrice: "12.50",
        product: {
          id: "demo-prod-2",
          name: "Avéline Lait Caramel",
          batchNumber: "EC-2024-0189",
          imageUrl: null,
        },
      },
      {
        id: "demo-oi-2b",
        quantity: 6,
        unitPrice: "12.50",
        product: {
          id: "demo-prod-4",
          name: "Avéline Noir 70% Origin",
          batchNumber: "PE-2024-0271",
          imageUrl: null,
        },
      },
    ],
  },
  {
    id: "demo-order-3",
    orderNumber: "AVL-2024-00412",
    status: "PENDING" as const,
    deliveryAddress: "Prinsengracht 88, 1015 DX Amsterdam",
    expectedDelivery: daysFromNow(7),
    totalAmount: "468.75",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    items: [
      {
        id: "demo-oi-3a",
        quantity: 15,
        unitPrice: "18.75",
        product: {
          id: "demo-prod-1",
          name: "Avéline Noir 85%",
          batchNumber: "GH-2024-0312",
          imageUrl: null,
        },
      },
      {
        id: "demo-oi-3b",
        quantity: 10,
        unitPrice: "15.00",
        product: {
          id: "demo-prod-3",
          name: "Avéline Blanc Framboise",
          batchNumber: "CI-2024-0445",
          imageUrl: null,
        },
      },
    ],
  },
];

// Extra historische orders zodat de analytics grafiek gevuld is (afgelopen 3 mnd)
export const DEMO_ANALYTICS_ORDERS = [
  ...DEMO_ORDERS,
  {
    id: "demo-order-h1",
    orderNumber: "AVL-2024-00280",
    status: "DELIVERED" as const,
    totalAmount: "187.50",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(42),
    deliveryAddress: "Keizersgracht 123, 1015 CJ Amsterdam",
    expectedDelivery: daysAgo(42),
    items: [
      {
        id: "demo-oi-h1a",
        quantity: 15,
        unitPrice: "12.50",
        product: { id: "demo-prod-2", name: "Avéline Lait Caramel", batchNumber: "EC-2024-0189", imageUrl: null },
      },
    ],
  },
  {
    id: "demo-order-h2",
    orderNumber: "AVL-2024-00251",
    status: "DELIVERED" as const,
    totalAmount: "262.50",
    createdAt: daysAgo(62),
    updatedAt: daysAgo(58),
    deliveryAddress: "Keizersgracht 123, 1015 CJ Amsterdam",
    expectedDelivery: daysAgo(58),
    items: [
      {
        id: "demo-oi-h2a",
        quantity: 8,
        unitPrice: "18.75",
        product: { id: "demo-prod-1", name: "Avéline Noir 85%", batchNumber: "GH-2024-0312", imageUrl: null },
      },
      {
        id: "demo-oi-h2b",
        quantity: 7,
        unitPrice: "12.50",
        product: { id: "demo-prod-4", name: "Avéline Noir 70% Origin", batchNumber: "PE-2024-0271", imageUrl: null },
      },
    ],
  },
  {
    id: "demo-order-h3",
    orderNumber: "AVL-2024-00199",
    status: "DELIVERED" as const,
    totalAmount: "150.00",
    createdAt: daysAgo(88),
    updatedAt: daysAgo(85),
    deliveryAddress: "Keizersgracht 123, 1015 CJ Amsterdam",
    expectedDelivery: daysAgo(85),
    items: [
      {
        id: "demo-oi-h3a",
        quantity: 12,
        unitPrice: "12.50",
        product: { id: "demo-prod-4", name: "Avéline Noir 70% Origin", batchNumber: "PE-2024-0271", imageUrl: null },
      },
    ],
  },
];

// ─── Complaints ───────────────────────────────────────────────────────────────

export const DEMO_COMPLAINTS = [
  {
    id: "demo-klacht-1",
    referenceNumber: "KL-2024-0891",
    type: "MELT_DAMAGE",
    status: "NEW" as const,
    priority: "HIGH" as const,
    description:
      "Bij levering was de gehele batch Avéline Noir 85% gesmolten en opnieuw gestold. De tabletten zijn misvormd en onverkoopbaar. Dit was doos nr. 3 t/m 7 van de levering.",
    createdAt: daysAgo(0, 2),
    updatedAt: daysAgo(0, 2),
    user: {
      id: "demo-user-b2c-1",
      firstName: "Soulaimane",
      lastName: "El Amrani",
      email: "soulaimane@example.nl",
      points: 340,
    },
    product: {
      name: "Avéline Noir 85%",
      batchNumber: "GH-2024-0312",
      origin: "Ghana",
      cacaoPercentage: 85,
    },
    statusHistory: [
      {
        id: "demo-sh-1a",
        status: "NEW",
        changedAt: daysAgo(0, 2),
        changedBy: "Systeem",
        note: "Klacht automatisch aangemaakt via app.",
      },
    ],
    crmNotes: [],
  },
  {
    id: "demo-klacht-2",
    referenceNumber: "KL-2024-0867",
    type: "BREAK_DAMAGE",
    status: "IN_PROGRESS" as const,
    priority: "MEDIUM" as const,
    description:
      "Meerdere tabletten Avéline Lait Caramel waren gebroken bij aankomst. Verpakking leek intact, maar product zat in stukken. Vermoedelijk een probleem bij het inpakken.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    user: {
      id: "demo-user-b2c-2",
      firstName: "Hamza",
      lastName: "Bouali",
      email: "hamza@example.nl",
      points: 210,
    },
    product: {
      name: "Avéline Lait Caramel",
      batchNumber: "EC-2024-0189",
      origin: "Ecuador",
      cacaoPercentage: 42,
    },
    statusHistory: [
      {
        id: "demo-sh-2a",
        status: "NEW",
        changedAt: daysAgo(3),
        changedBy: "Systeem",
        note: "Klacht automatisch aangemaakt via app.",
      },
      {
        id: "demo-sh-2b",
        status: "IN_PROGRESS",
        changedAt: daysAgo(1),
        changedBy: "Esad Yilmaz",
        note: "In behandeling genomen. Contact opgenomen met logistieke partner.",
      },
    ],
    crmNotes: [
      {
        id: "demo-crm-2a",
        content: "Klant gebeld. Bereid vervangende levering te accepteren. Terugbellen zodra logistiek bevestigt.",
        createdBy: "Esad Yilmaz",
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: "demo-klacht-3",
    referenceNumber: "KL-2024-0844",
    type: "TEXTURE_DEVIATION",
    status: "RESOLVED" as const,
    priority: "LOW" as const,
    description:
      "De Avéline Blanc Framboise had een korrelige textuur die afwijkt van de standaard. Klant vermoedde dat de batch te warm bewaard is geweest.",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(4),
    user: {
      id: "demo-user-b2c-1",
      firstName: "Soulaimane",
      lastName: "El Amrani",
      email: "soulaimane@example.nl",
      points: 340,
    },
    product: {
      name: "Avéline Blanc Framboise",
      batchNumber: "CI-2024-0445",
      origin: "Ivoorkust",
      cacaoPercentage: 30,
    },
    statusHistory: [
      {
        id: "demo-sh-3a",
        status: "NEW",
        changedAt: daysAgo(10),
        changedBy: "Systeem",
        note: "Klacht automatisch aangemaakt.",
      },
      {
        id: "demo-sh-3b",
        status: "IN_PROGRESS",
        changedAt: daysAgo(8),
        changedBy: "Esad Yilmaz",
        note: "Kwaliteitscontrole batch CI-2024-0445 gestart.",
      },
      {
        id: "demo-sh-3c",
        status: "RESOLVED",
        changedAt: daysAgo(4),
        changedBy: "Esad Yilmaz",
        note: "Onderzoek afgerond. Bewaartemperatuur bij klant was te hoog. Advies gegeven. Klant akkoord.",
      },
    ],
    crmNotes: [
      {
        id: "demo-crm-3a",
        content: "Batch CI-2024-0445 voldoet aan kwaliteitsnormen. Probleem lag bij bewaring bij klant (>22°C).",
        createdBy: "Esad Yilmaz",
        createdAt: daysAgo(5),
      },
    ],
  },
];

// ─── Chat sessies — B2C ────────────────────────────────────────────────────────

export const DEMO_CHAT_SESSIONS_B2C = [
  {
    id: "demo-chat-b2c-1",
    isActive: true,
    rating: null,
    createdAt: daysAgo(0, 1),
    closedAt: null,
    assignedAgent: null,
    messages: [
      {
        id: "demo-msg-b2c-1a",
        senderType: "bot" as const,
        content: "Hoi! Ik ben de Avéline assistent. Waarmee kan ik je helpen?",
        createdAt: daysAgo(0, 1),
      },
      {
        id: "demo-msg-b2c-1b",
        senderType: "user" as const,
        content: "Waar is mijn bestelling? Ik heb al 5 dagen niets gehoord.",
        createdAt: daysAgo(0, 1),
      },
      {
        id: "demo-msg-b2c-1c",
        senderType: "bot" as const,
        content:
          "Ik begrijp je bezorgdheid! Ik verbind je door met een medewerker die dit voor je kan uitzoeken. Gemiddelde wachttijd is nu minder dan 5 minuten.",
        createdAt: daysAgo(0, 1),
      },
    ],
  },
  {
    id: "demo-chat-b2c-2",
    isActive: false,
    rating: 4,
    createdAt: daysAgo(5),
    closedAt: daysAgo(5),
    assignedAgent: "Esad Yilmaz",
    messages: [
      {
        id: "demo-msg-b2c-2a",
        senderType: "bot" as const,
        content: "Hoi! Ik ben de Avéline assistent. Waarmee kan ik je helpen?",
        createdAt: daysAgo(5),
      },
      {
        id: "demo-msg-b2c-2b",
        senderType: "user" as const,
        content: "Ik wil een klacht indienen over een beschadigd product.",
        createdAt: daysAgo(5),
      },
      {
        id: "demo-msg-b2c-2c",
        senderType: "agent" as const,
        content:
          "Goedemiddag! Ik ben Esad van de klantenservice. Ik ga je klacht direct registreren. Kun je het batchnummer van het product doorgeven?",
        createdAt: daysAgo(5),
      },
      {
        id: "demo-msg-b2c-2d",
        senderType: "user" as const,
        content: "Het batchnummer is EC-2024-0189.",
        createdAt: daysAgo(5),
      },
      {
        id: "demo-msg-b2c-2e",
        senderType: "agent" as const,
        content:
          "Bedankt! Ik heb de klacht aangemaakt onder referentienummer KL-2024-0867. Je ontvangt een melding zodra we een update hebben.",
        createdAt: daysAgo(5),
      },
    ],
  },
];

// ─── Chat sessies — Klantenservice ────────────────────────────────────────────

export const DEMO_CHAT_SESSIONS_CS = [
  {
    id: "demo-chat-cs-1",
    isActive: true,
    assignedAgent: null,
    rating: null,
    createdAt: daysAgo(0, 1),
    user: {
      id: "demo-user-b2c-1",
      firstName: "Soulaimane",
      lastName: "El Amrani",
      email: "soulaimane@example.nl",
      points: 340,
      _count: { scans: 12, communityPosts: 3, complaints: 2 },
    },
    messages: [
      {
        id: "demo-msg-cs-1a",
        senderType: "bot" as const,
        content: "Hoi! Ik ben de Avéline assistent. Waarmee kan ik je helpen?",
        createdAt: daysAgo(0, 1),
      },
      {
        id: "demo-msg-cs-1b",
        senderType: "user" as const,
        content: "Waar is mijn bestelling? Ik heb al 5 dagen niets gehoord.",
        createdAt: daysAgo(0, 1),
      },
      {
        id: "demo-msg-cs-1c",
        senderType: "bot" as const,
        content:
          "Ik begrijp je bezorgdheid! Ik verbind je door met een medewerker. Gemiddelde wachttijd is nu minder dan 5 minuten.",
        createdAt: daysAgo(0, 1),
      },
    ],
  },
  {
    id: "demo-chat-cs-2",
    isActive: true,
    assignedAgent: "Esad Yilmaz",
    rating: null,
    createdAt: daysAgo(0, 3),
    user: {
      id: "demo-user-b2c-2",
      firstName: "Hamza",
      lastName: "Bouali",
      email: "hamza@example.nl",
      points: 210,
      _count: { scans: 7, communityPosts: 1, complaints: 1 },
    },
    messages: [
      {
        id: "demo-msg-cs-2a",
        senderType: "user" as const,
        content: "Ik wil een klacht indienen over een beschadigd product.",
        createdAt: daysAgo(0, 3),
      },
      {
        id: "demo-msg-cs-2b",
        senderType: "agent" as const,
        content:
          "Goedemiddag! Ik ben Esad. Ik ga je klacht direct registreren. Kun je het batchnummer doorgeven?",
        createdAt: daysAgo(0, 3),
      },
      {
        id: "demo-msg-cs-2c",
        senderType: "user" as const,
        content: "EC-2024-0189.",
        createdAt: daysAgo(0, 3),
      },
      {
        id: "demo-msg-cs-2d",
        senderType: "agent" as const,
        content:
          "Bedankt. Ik heb de klacht aangemaakt onder KL-2024-0867. We nemen contact op zodra we een update hebben.",
        createdAt: daysAgo(0, 3),
      },
    ],
  },
  {
    id: "demo-chat-cs-3",
    isActive: false,
    assignedAgent: "Esad Yilmaz",
    rating: 5,
    createdAt: daysAgo(2),
    user: {
      id: "demo-user-b2c-3",
      firstName: "Fatima",
      lastName: "Ouahbi",
      email: "fatima@example.nl",
      points: 95,
      _count: { scans: 4, communityPosts: 0, complaints: 0 },
    },
    messages: [
      {
        id: "demo-msg-cs-3a",
        senderType: "user" as const,
        content: "Kan ik informatie krijgen over de Fairtrade certificering van jullie producten?",
        createdAt: daysAgo(2),
      },
      {
        id: "demo-msg-cs-3b",
        senderType: "agent" as const,
        content:
          "Natuurlijk! Al onze Fairtrade gecertificeerde producten zijn gemarkeerd in de app. Wil je meer details over een specifiek product?",
        createdAt: daysAgo(2),
      },
      {
        id: "demo-msg-cs-3c",
        senderType: "user" as const,
        content: "Nee, dit is genoeg. Dank je wel!",
        createdAt: daysAgo(2),
      },
    ],
  },
];

// ─── Community posts ──────────────────────────────────────────────────────────

export const DEMO_COMMUNITY_POSTS = [
  {
    id: "demo-post-1",
    title: "Recept: chocolademousse met Avéline Noir 85%",
    content:
      "Ik heb gisteren een fantastische chocolademousse gemaakt met de Noir 85%. Het recept is verrassend simpel: smelt 150g chocolade au bain-marie, klop 3 eiwitten stijf, spatel ze door de afgekoelde chocolade en laat 2 uur opstijven in de koelkast. Het resultaat is intens, romig en niet te zoet. Aanrader!",
    imageUrls: [] as string[],
    isPinned: true,
    createdAt: daysAgo(2),
    user: { id: "demo-user-b2c-1", firstName: "Soulaimane", lastName: "El Amrani" },
    _count: { comments: 3 },
    comments: [
      {
        id: "demo-comment-1a",
        content: "Geweldig recept! Ik ga het dit weekend proberen.",
        createdAt: daysAgo(1, 18),
        user: { id: "demo-user-b2c-2", firstName: "Hamza", lastName: "Bouali" },
      },
      {
        id: "demo-comment-1b",
        content: "Voeg een snufje cayennepeper toe — dat combineert perfect met de 85%!",
        createdAt: daysAgo(1, 14),
        user: { id: "demo-user-b2c-3", firstName: "Fatima", lastName: "Ouahbi" },
      },
      {
        id: "demo-comment-1c",
        content: "Ik heb het geprobeerd met sinaasappelrasp erbij, ook echt lekker!",
        createdAt: daysAgo(0, 8),
        user: { id: "demo-user-b2c-1", firstName: "Soulaimane", lastName: "El Amrani" },
      },
    ],
  },
  {
    id: "demo-post-2",
    title: "Vergelijking: Noir 70% vs Noir 85%",
    content:
      "Ik heb beide puurse varianten naast elkaar geproefd. De 70% heeft een zachtere, fruitigere smaak met tonen van zwarte bes. De 85% is intenser, wat bitterder maar met een mooie afwerking. Voor dagelijks genieten ga ik voor de 70%, maar voor bakken kies ik de 85%. Welke is jullie favoriet?",
    imageUrls: [] as string[],
    isPinned: false,
    createdAt: daysAgo(6),
    user: { id: "demo-user-b2c-3", firstName: "Fatima", lastName: "Ouahbi" },
    _count: { comments: 2 },
    comments: [
      {
        id: "demo-comment-2a",
        content: "Absoluut de 85% voor mij. Hoe hoger het percentage, hoe beter!",
        createdAt: daysAgo(5),
        user: { id: "demo-user-b2c-1", firstName: "Soulaimane", lastName: "El Amrani" },
      },
      {
        id: "demo-comment-2b",
        content: "Ik ga voor de 70% — mijn kinderen lusten de 85% niet 😅",
        createdAt: daysAgo(4),
        user: { id: "demo-user-b2c-2", firstName: "Hamza", lastName: "Bouali" },
      },
    ],
  },
  {
    id: "demo-post-3",
    title: null,
    content:
      "Zojuist de Avéline Blanc Framboise geprobeerd uit de limited edition zomercollectie. Wow — de combinatie van witte chocolade met gevriesdroogde framboos is verslaving wekkend. Hoop dat dit een permanente lijn wordt!",
    imageUrls: [] as string[],
    isPinned: false,
    createdAt: daysAgo(9),
    user: { id: "demo-user-b2c-2", firstName: "Hamza", lastName: "Bouali" },
    _count: { comments: 1 },
    comments: [
      {
        id: "demo-comment-3a",
        content: "Helemaal eens! Ik heb er al twee besteld voor als cadeau.",
        createdAt: daysAgo(8),
        user: { id: "demo-user-b2c-3", firstName: "Fatima", lastName: "Ouahbi" },
      },
    ],
  },
];

// ─── Promotions ───────────────────────────────────────────────────────────────

export const DEMO_PROMOTIONS = [
  {
    id: "demo-promo-1",
    title: "Zomercollectie 2024 — nu verkrijgbaar",
    body: "Ontdek onze nieuwe limited edition zomercollectie! De Avéline Blanc Framboise is nu beschikbaar. Bestel voor 31 juli en ontvang gratis verzending.",
    imageUrl: null,
    discountCode: "ZOMER24",
    targetSegment: "b2c",
    status: "SENT" as const,
    scheduledAt: null,
    sentAt: daysAgo(7),
    createdAt: daysAgo(8),
  },
  {
    id: "demo-promo-2",
    title: "Exclusief B2B aanbod — zomerkorting",
    body: "Als zakelijke partner ontvang je deze zomer 10% korting op alle bestellingen boven €500. Gebruik de kortingscode bij het afrekenen.",
    imageUrl: null,
    discountCode: "B2B10",
    targetSegment: "b2b",
    status: "SCHEDULED" as const,
    scheduledAt: daysFromNow(3),
    sentAt: null,
    createdAt: daysAgo(1),
  },
  {
    id: "demo-promo-3",
    title: "Terug naar school — chocolade voor in de broodtrommel",
    body: "September staat voor de deur! Ontdek onze kleinere formaten, perfect voor in de broodtrommel. Speciaal tarief voor schoolpakketten.",
    imageUrl: null,
    discountCode: null,
    targetSegment: "all",
    status: "DRAFT" as const,
    scheduledAt: null,
    sentAt: null,
    createdAt: daysAgo(0, 4),
  },
];
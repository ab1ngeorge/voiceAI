/**
 * LBS College Campus Locations Database
 * 18 verified campus locations with Google Maps links
 * Plus navigation routes in English, Manglish, and Malayalam
 */

// Navigation route interface
export interface NavigationRoute {
  from: string;
  to: string;
  steps: {
    en: string[];
    manglish: string[];
    ml: string[];
  };
}

// Campus navigation routes with multilingual steps
export const NAVIGATION_ROUTES: NavigationRoute[] = [
  {
    from: "Main Entrance",
    to: "Administrative Block",
    steps: {
      en: ["You are at the main entrance", "Go straight", "You have reached the Administrative Block"],
      manglish: ["Ningal ippol main entrance-il aanu", "Straight aayi munnottu pokuka", "Ningal Administrative Block-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ മെയിൻ എൻട്രൻസിലാണ്", "നേരെ മുന്നോട്ട് പോവുക", "നിങ്ങൾ അഡ്മിനിസ്ട്രേറ്റീവ് ബ്ലോക്കിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "Main Entrance",
    to: "MH2 Men's Hostel",
    steps: {
      en: ["You are at the main entrance", "Turn left", "You have reached MH2 Men's Hostel"],
      manglish: ["Ningal ippol main entrance-il aanu", "Left side-il thiriyuka", "Ningal MH2 men's hostel-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ മെയിൻ എൻട്രൻസിലാണ്", "ഇടത്തോട്ട് തിരിയുക", "നിങ്ങൾ MH2 മെൻസ് ഹോസ്റ്റലിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "Main Entrance",
    to: "MH1 Men's Hostel",
    steps: {
      en: ["You are at the main entrance", "Turn right", "You have reached MH1 Men's Hostel"],
      manglish: ["Ningal ippol main entrance-il aanu", "Right side-il thiriyuka", "Ningal MH1 men's hostel-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ മെയിൻ എൻട്രൻസിലാണ്", "വലത്തോട്ട് തിരിയുക", "നിങ്ങൾ MH1 മെൻസ് ഹോസ്റ്റലിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "Administrative Block",
    to: "Basketball Court",
    steps: {
      en: ["You are at the Administrative Block", "Look opposite to the block", "Turn left", "You have reached the basketball court"],
      manglish: ["Ningal ippol Administrative Block-il aanu", "Block-inte opposite side nokkuka", "Left side-il thiriyuka", "Ningal basketball court-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ അഡ്മിനിസ്ട്രേറ്റീവ് ബ്ലോക്കിലാണ്", "ബ്ലോക്കിന്റെ എതിർവശത്തേക്ക് നോക്കുക", "ഇടത്തോട്ട് തിരിയുക", "നിങ്ങൾ ബാസ്കറ്റ്ബോൾ കോർട്ടിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "Administrative Block",
    to: "College Canteen",
    steps: {
      en: ["You are at the Administrative Block", "Turn left", "Go down the road", "You have reached the college canteen"],
      manglish: ["Ningal ippol Administrative Block-il aanu", "Left side-il thiriyuka", "Down road vazhi pokuka", "Ningal college canteen-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ അഡ്മിനിസ്ട്രേറ്റീവ് ബ്ലോക്കിലാണ്", "ഇടത്തോട്ട് തിരിയുക", "താഴേക്ക് പോകുന്ന റോഡിലൂടെ പോവുക", "നിങ്ങൾ കോളേജ് കാന്റീനിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "Administrative Block",
    to: "Central Library",
    steps: {
      en: ["You are at the Administrative Block", "Go straight", "You have reached the central library"],
      manglish: ["Ningal ippol Administrative Block-il aanu", "Straight aayi pokuka", "Ningal central library-yil ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ അഡ്മിനിസ്ട്രേറ്റീവ് ബ്ലോക്കിലാണ്", "നേരെ മുന്നോട്ട് പോവുക", "നിങ്ങൾ സെൻട്രൽ ലൈബ്രറിയിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "Central Library",
    to: "Reprographic Centre",
    steps: {
      en: ["You are at the central library", "Move to the next building", "You have reached the reprographic centre"],
      manglish: ["Ningal ippol central library-yil aanu", "Next building-ilekku pokuka", "Ningal reprographic centre-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ സെൻട്രൽ ലൈബ്രറിയിലാണ്", "അടുത്ത കെട്ടിടത്തിലേക്ക് പോവുക", "നിങ്ങൾ റീപ്രോഗ്രാഫിക് സെന്ററിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "Central Library",
    to: "CSE Block",
    steps: {
      en: ["You are at the central library", "Continue walking straight", "You have reached the CSE block"],
      manglish: ["Ningal ippol central library-yil aanu", "Straight aayi nadichu pokuka", "Ningal CSE block-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ സെൻട്രൽ ലൈബ്രറിയിലാണ്", "നേരെ നടന്നു പോവുക", "നിങ്ങൾ CSE ബ്ലോക്കിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "College Canteen",
    to: "Mechanical Engineering Department",
    steps: {
      en: ["You are at the college canteen", "Turn right", "You have reached the Mechanical Engineering Department"],
      manglish: ["Ningal ippol college canteen-il aanu", "Right side-il thiriyuka", "Ningal Mechanical Engineering Department-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ കോളേജ് കാന്റീനിലാണ്", "വലത്തോട്ട് തിരിയുക", "നിങ്ങൾ മെക്കാനിക്കൽ എഞ്ചിനീയറിംഗ് ഡിപ്പാർട്ട്മെന്റിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "College Canteen",
    to: "Ladies Hostel",
    steps: {
      en: ["You are at the college canteen", "Turn left", "Go straight", "You have reached the ladies hostel"],
      manglish: ["Ningal ippol college canteen-il aanu", "Left side-il thiriyuka", "Straight aayi pokuka", "Ningal ladies hostel-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ കോളേജ് കാന്റീനിലാണ്", "ഇടത്തോട്ട് തിരിയുക", "നേരെ മുന്നോട്ട് പോവുക", "നിങ്ങൾ ലേഡീസ് ഹോസ്റ്റലിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "College Canteen",
    to: "College Ground",
    steps: {
      en: ["You are at the college canteen", "Turn left", "Continue straight", "You have reached the college ground"],
      manglish: ["Ningal ippol college canteen-il aanu", "Left side-il thiriyuka", "Straight aayi thuduka", "Ningal college ground-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ കോളേജ് കാന്റീനിലാണ്", "ഇടത്തോട്ട് തിരിയുക", "നേരെ തുടരുക", "നിങ്ങൾ കോളേജ് ഗ്രൗണ്ടിൽ എത്തിയിരിക്കുന്നു"]
    }
  },
  {
    from: "College Canteen",
    to: "L-Block",
    steps: {
      en: ["You are at the college canteen", "Turn right", "Go to the end of the road", "You have reached L-Block"],
      manglish: ["Ningal ippol college canteen-il aanu", "Right side-il thiriyuka", "Road inte end vare pokuka", "Ningal L-Block-il ethiyirikkunnu"],
      ml: ["നിങ്ങൾ ഇപ്പോൾ കോളേജ് കാന്റീനിലാണ്", "വലത്തോട്ട് തിരിയുക", "റോഡിന്റെ അവസാനത്തോളം പോവുക", "നിങ്ങൾ എൽ-ബ്ലോക്കിൽ എത്തിയിരിക്കുന്നു"]
    }
  }
];

// L-Block contains these facilities
export const L_BLOCK_FACILITIES = [
  "Civil Engineering Department",
  "College Stage",
  "EC Lab",
  "Mechanical Lab"
];

export interface CampusLocation {
  id: string;
  name: string;
  malayalamName: string;
  category: 'admin' | 'academic' | 'facility' | 'hostel' | 'sports' | 'amenity';
  description: string;
  mapsUrl: string;
  keywords: string[];
  floor?: string;
  timings?: string;
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  // ==========================================
  // 🏛️ MAIN CAMPUS & ADMINISTRATION
  // ==========================================
  {
    id: "main-entrance",
    name: "LBS College of Engineering - Main Entrance",
    malayalamName: "LBS കോളേജ് - പ്രധാന കവാടം",
    category: "admin",
    description: "Main entrance gate of LBS College of Engineering. Entry point for all visitors with security check.",
    mapsUrl: "https://maps.app.goo.gl/MgJURkMksGx7neiZ8",
    keywords: ["main", "entrance", "gate", "entry", "college", "lbs", "front"],
  },
  {
    id: "academic-block",
    name: "Academic Departments (General Area)",
    malayalamName: "അക്കാദമിക് വിഭാഗങ്ങൾ",
    category: "academic",
    description: "Central academic block housing multiple department offices and classrooms.",
    mapsUrl: "https://maps.app.goo.gl/2PvfbFGAkUFjFBjS6",
    keywords: ["academic", "department", "block", "building", "class", "office"],
  },

  // ==========================================
  // 🎓 DEPARTMENTS
  // ==========================================
  {
    id: "mech-dept",
    name: "Department of Mechanical Engineering",
    malayalamName: "മെക്കാനിക്കൽ എഞ്ചിനീയറിംഗ് വിഭാഗം",
    category: "academic",
    description: "Mechanical Engineering department with workshops, labs, and faculty offices.",
    mapsUrl: "https://maps.app.goo.gl/ZpHNZt62DzfHEMWWA",
    keywords: ["mechanical", "mech", "me", "workshop", "automobile", "production"],
  },
  {
    id: "cse-it-dept",
    name: "Computer Science & IT Department Building",
    malayalamName: "കമ്പ്യൂട്ടർ സയൻസ് & ഐടി വിഭാഗം",
    category: "academic",
    description: "Computer Science and Information Technology department with programming labs and classrooms.",
    mapsUrl: "https://maps.app.goo.gl/y7epqn9H51K4fBBJ8",
    keywords: ["cse", "cs", "computer", "it", "programming", "software", "coding", "lab"],
  },

  // ==========================================
  // 🔬 ACADEMIC FACILITIES
  // ==========================================
  {
    id: "central-library",
    name: "Central Library",
    malayalamName: "കേന്ദ്ര ലൈബ്രറി",
    category: "facility",
    description: "Central library with 50,000+ books, journals, digital resources, and reading rooms. Open 9 AM - 6 PM.",
    mapsUrl: "https://maps.app.goo.gl/uNePErUh3hs4kUWP9",
    keywords: ["library", "books", "reading", "study", "journal", "reference"],
    timings: "9:00 AM - 6:00 PM (Extended till 9 PM during exams)",
  },
  {
    id: "fab-lab",
    name: "Campus Fab Lab",
    malayalamName: "ഫാബ് ലാബ്",
    category: "facility",
    description: "Fabrication laboratory with 3D printers, CNC machines, laser cutters, and prototyping equipment.",
    mapsUrl: "https://maps.app.goo.gl/3rz8e5WXZ3UytSze7",
    keywords: ["fab", "lab", "fabrication", "3d", "printer", "cnc", "prototype", "maker"],
  },
  {
    id: "computer-lab",
    name: "Computer Lab",
    malayalamName: "കമ്പ്യൂട്ടർ ലാബ്",
    category: "facility",
    description: "Main computer laboratory with 100+ systems for programming and project work.",
    mapsUrl: "https://maps.app.goo.gl/jKVxbxhyhhuu5Bk5A",
    keywords: ["computer", "lab", "pc", "programming", "systems", "internet"],
  },
  {
    id: "reprographic-centre",
    name: "Reprographic Centre",
    malayalamName: "റീപ്രോഗ്രാഫിക് സെന്റർ",
    category: "facility",
    description: "Photocopying, printing, and document services for students and faculty.",
    mapsUrl: "https://maps.app.goo.gl/FZ72xAAczEwk2mgi7",
    keywords: ["xerox", "photocopy", "print", "reprographic", "document", "copy"],
  },

  // ==========================================
  // ⚽ SPORTS & RECREATION
  // ==========================================
  {
    id: "multipurpose-sports",
    name: "Multipurpose Sports Area",
    malayalamName: "മൾട്ടിപർപ്പസ് സ്പോർട്സ് ഏരിയ",
    category: "sports",
    description: "Indoor and outdoor multipurpose area for basketball, volleyball, badminton, and other sports.",
    mapsUrl: "https://maps.app.goo.gl/7udrNyuqcpqFt9QdA",
    keywords: ["sports", "multipurpose", "basketball", "volleyball", "badminton", "indoor", "court"],
  },
  {
    id: "football-ground",
    name: "LBS College Football Ground (7's Ground)",
    malayalamName: "ഫുട്ബോൾ ഗ്രൗണ്ട്",
    category: "sports",
    description: "Football ground for 7-a-side matches and practice sessions.",
    mapsUrl: "https://maps.app.goo.gl/Ac3hF8A5NzUYAUXX9",
    keywords: ["football", "ground", "soccer", "sevens", "7s", "play", "field"],
  },

  // ==========================================
  // 🏠 HOSTELS & ACCOMMODATION
  // ==========================================
  {
    id: "mens-hostel",
    name: "Men's Hostel",
    malayalamName: "ആൺകുട്ടികളുടെ ഹോസ്റ്റൽ",
    category: "hostel",
    description: "Boys hostel with 300+ bed capacity. Includes mess facility, WiFi, and common rooms.",
    mapsUrl: "https://maps.app.goo.gl/LsvhTeDypf263vEB7",
    keywords: ["boys", "hostel", "men", "accommodation", "room", "stay", "mens"],
  },
  {
    id: "ladies-hostel",
    name: "Shahanas Hostel (Ladies Hostel)",
    malayalamName: "ഷഹനാസ് ഹോസ്റ്റൽ (പെൺകുട്ടികളുടെ ഹോസ്റ്റൽ)",
    category: "hostel",
    description: "Girls hostel with 200+ bed capacity. Named 'Shahanas Hostel'. 24/7 security and warden.",
    mapsUrl: "https://maps.app.goo.gl/YatNVBSMh2kk34N76",
    keywords: ["girls", "hostel", "ladies", "women", "shahanas", "accommodation", "room"],
  },

  // ==========================================
  // 🍽️ STUDENT AMENITIES
  // ==========================================
  {
    id: "canteen",
    name: "College Canteen",
    malayalamName: "കോളേജ് കാന്റീൻ",
    category: "amenity",
    description: "Main college canteen serving breakfast, lunch, snacks, and beverages at subsidized rates.",
    mapsUrl: "https://maps.app.goo.gl/rCmEM7mRmDZ5aGzx8",
    keywords: ["canteen", "food", "eat", "lunch", "breakfast", "snack", "tea", "coffee", "mess"],
    timings: "8:00 AM - 6:00 PM",
  },
  {
    id: "malloc-cafe",
    name: "Malloc (Student Hangout/Cafe)",
    malayalamName: "മാലോക്",
    category: "amenity",
    description: "Popular student hangout spot and cafe. Great for group discussions and breaks.",
    mapsUrl: "https://maps.app.goo.gl/YSNeu8quVya8Q2rG7",
    keywords: ["malloc", "cafe", "hangout", "coffee", "snacks", "chill", "friends"],
  },
  {
    id: "sbi-atm",
    name: "SBI ATM",
    malayalamName: "SBI ATM",
    category: "amenity",
    description: "State Bank of India ATM located inside campus for cash withdrawals.",
    mapsUrl: "https://maps.app.goo.gl/Bjvi4taHV9gabc3bA",
    keywords: ["atm", "sbi", "bank", "cash", "money", "withdraw"],
  },
  {
    id: "coop-society",
    name: "Student Co-Operative Society",
    malayalamName: "വിദ്യാർത്ഥി സഹകരണ സംഘം",
    category: "amenity",
    description: "Student cooperative store selling stationery, lab records, drawing sheets, and essentials.",
    mapsUrl: "https://maps.app.goo.gl/vZdwXwC62odZn53G7",
    keywords: ["coop", "cooperative", "store", "shop", "stationery", "record", "book"],
  },

  // ==========================================
  // 🔧 UTILITIES & SERVICES
  // ==========================================
  {
    id: "bus-garage",
    name: "Bus Garage / Transport Area",
    malayalamName: "ബസ് ഗാരേജ്",
    category: "facility",
    description: "College bus parking and transport office. Bus schedules and passes available here.",
    mapsUrl: "https://maps.app.goo.gl/9WUemftWwmGohsRW8",
    keywords: ["bus", "transport", "garage", "vehicle", "parking", "travel"],
  },
  {
    id: "electrical-control",
    name: "Electrical Control Room",
    malayalamName: "ഇലക്ട്രിക്കൽ കൺട്രോൾ റൂം",
    category: "facility",
    description: "Main electrical control room. Report power issues here.",
    mapsUrl: "https://maps.app.goo.gl/NdGXX3SKfzGHnFnq8",
    keywords: ["electrical", "control", "power", "electricity", "switch", "generator"],
  },
  {
    id: "l-block",
    name: "L-Block",
    malayalamName: "എൽ-ബ്ലോക്ക്",
    category: "academic",
    description: "L-Block houses Civil Engineering Department, College Stage, EC Lab, and Mechanical Lab.",
    mapsUrl: "https://maps.app.goo.gl/zeqxnoZuk7fuG6iQ9",
    keywords: ["l-block", "l block", "civil", "stage", "ec lab", "mechanical lab"],
    floor: "Multiple floors",
  },
];

// Fuzzy keyword mappings for common variations
const FUZZY_MAPPINGS: Record<string, string> = {
  'principal office': 'main-entrance',
  'admin': 'academic-block',
  'food': 'canteen',
  'eat': 'canteen',
  'hungry': 'canteen',
  'study': 'central-library',
  'books': 'central-library',
  'boys staying': 'mens-hostel',
  'girls staying': 'ladies-hostel',
  'print': 'reprographic-centre',
  'xerox': 'reprographic-centre',
  'money': 'sbi-atm',
  'games': 'multipurpose-sports',
  'play': 'football-ground',
  '3d print': 'fab-lab',
  'prototype': 'fab-lab',
};

/**
 * Find a campus location by query
 */
export function findLocation(query: string): CampusLocation | null {
  const queryLower = query.toLowerCase();

  // Direct keyword match
  for (const location of CAMPUS_LOCATIONS) {
    // Check keywords
    if (location.keywords.some(kw => queryLower.includes(kw))) {
      return location;
    }

    // Check name
    if (location.name.toLowerCase().includes(queryLower)) {
      return location;
    }

    // Check Malayalam name
    if (location.malayalamName.includes(query)) {
      return location;
    }
  }

  // Fuzzy matching for common variations
  for (const [key, locationId] of Object.entries(FUZZY_MAPPINGS)) {
    if (queryLower.includes(key)) {
      return CAMPUS_LOCATIONS.find(loc => loc.id === locationId) || null;
    }
  }

  return null;
}

/**
 * Get all locations grouped by category
 */
export function getLocationsByCategory(): Record<string, CampusLocation[]> {
  const grouped: Record<string, CampusLocation[]> = {
    admin: [],
    academic: [],
    facility: [],
    hostel: [],
    sports: [],
    amenity: [],
  };

  for (const location of CAMPUS_LOCATIONS) {
    grouped[location.category].push(location);
  }

  return grouped;
}

/**
 * Build navigation response with maps link
 */
export function buildNavigationResponse(
  query: string,
  language: 'en' | 'ml' | 'manglish'
): { text: string; mapsUrl: string; location: CampusLocation } | null {
  const location = findLocation(query);

  if (!location) {
    return null;
  }

  const responses = {
    en: `${location.name} is located on campus. ${location.description}${location.timings ? ` Timings: ${location.timings}.` : ''} Here's the Google Maps link for directions.`,
    ml: `${location.malayalamName} ക്യാമ്പസിൽ സ്ഥിതി ചെയ്യുന്നു. ${location.description}${location.timings ? ` സമയം: ${location.timings}.` : ''} Google Maps ലിങ്ക് ഇതാ.`,
    manglish: `${location.name} campus il aanu. ${location.description}${location.timings ? ` Timings: ${location.timings}.` : ''} Google Maps link ithaanu.`,
  };

  return {
    text: responses[language],
    mapsUrl: location.mapsUrl,
    location: location,
  };
}

/**
 * Check if a query is a location query
 */
export function isLocationQuery(query: string): boolean {
  const locationKeywords = [
    'where', 'location', 'direction', 'how to reach', 'find', 'navigate',
    'evide', 'evidey', 'evidanu', 'sthalam', 'sthithi', 'എവിടെ', 'സ്ഥലം',
    'map', 'maps', 'go to', 'reach', 'way to', 'route', 'engane pokam'
  ];

  const queryLower = query.toLowerCase();
  return locationKeywords.some(kw => queryLower.includes(kw)) || findLocation(query) !== null;
}

/**
 * Find navigation route between two locations
 */
export function findNavigationRoute(
  from: string,
  to: string,
  language: 'en' | 'ml' | 'manglish'
): { steps: string[]; from: string; to: string } | null {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  for (const route of NAVIGATION_ROUTES) {
    const routeFromLower = route.from.toLowerCase();
    const routeToLower = route.to.toLowerCase();

    // Match either exact or partial
    if ((routeFromLower.includes(fromLower) || fromLower.includes(routeFromLower)) &&
      (routeToLower.includes(toLower) || toLower.includes(routeToLower))) {
      return {
        steps: route.steps[language] || route.steps.en,
        from: route.from,
        to: route.to
      };
    }
  }

  return null;
}

/**
 * Build navigation directions text
 */
export function buildDirections(
  from: string,
  to: string,
  language: 'en' | 'ml' | 'manglish'
): string | null {
  const route = findNavigationRoute(from, to, language);

  if (!route) {
    return null;
  }

  return route.steps.join('. ') + '.';
}

/**
 * Get all available navigation routes for display
 */
export function getAllRoutes(): { from: string; to: string }[] {
  return NAVIGATION_ROUTES.map(route => ({
    from: route.from,
    to: route.to
  }));
}


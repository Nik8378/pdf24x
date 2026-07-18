// Shared ISBN engine — validation, normalization, conversion, country lookup.
// All operations run in the browser.

export type ISBNType = "ISBN-10" | "ISBN-13" | "invalid";

export interface ValidationResult {
  input: string;
  normalized: string; // digits only (with X for ISBN-10)
  type: ISBNType;
  valid: boolean;
  reason?: string;
  format?: string; // hyphenated form
  isbn13?: string;
  isbn10?: string;
  registrationGroup?: string; // e.g. "978-0"
  countryOrLanguage?: string;
}

/** Strip everything except digits and X/x. Returns uppercase. */
export function normalize(raw: string): string {
  return (raw || "").replace(/[^0-9Xx]/g, "").toUpperCase();
}

/** ISBN-10 check digit (0-9 or X). */
export function checkDigit10(nineDigits: string): string {
  if (!/^\d{9}$/.test(nineDigits)) throw new Error("Need 9 digits");
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (i + 1) * parseInt(nineDigits[i], 10);
  const r = sum % 11;
  return r === 10 ? "X" : String(r);
}

/** ISBN-13 check digit. */
export function checkDigit13(twelveDigits: string): string {
  if (!/^\d{12}$/.test(twelveDigits)) throw new Error("Need 12 digits");
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(twelveDigits[i], 10) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

export function isValidISBN10(s: string): boolean {
  const n = normalize(s);
  if (!/^\d{9}[\dX]$/.test(n)) return false;
  return checkDigit10(n.slice(0, 9)) === n[9];
}

export function isValidISBN13(s: string): boolean {
  const n = normalize(s);
  if (!/^\d{13}$/.test(n)) return false;
  if (!(n.startsWith("978") || n.startsWith("979"))) return false;
  return checkDigit13(n.slice(0, 12)) === n[12];
}

/** Convert ISBN-10 → ISBN-13 (prefix 978). */
export function to13(isbn10: string): string {
  const n = normalize(isbn10);
  if (n.length !== 10) throw new Error("Need ISBN-10");
  const twelve = "978" + n.slice(0, 9);
  return twelve + checkDigit13(twelve);
}

/** Convert ISBN-13 → ISBN-10 (only if prefix is 978). Returns null for 979-. */
export function to10(isbn13: string): string | null {
  const n = normalize(isbn13);
  if (n.length !== 13 || !n.startsWith("978")) return null;
  const nine = n.slice(3, 12);
  return nine + checkDigit10(nine);
}

/** ISBN registration groups (prefix → country/language).
 * Source: International ISBN Agency. Trimmed to the most common. */
const GROUPS: { prefix: string; name: string }[] = [
  { prefix: "978-0", name: "English language (US, UK, AU, CA, NZ, IE, ZA)" },
  { prefix: "978-1", name: "English language (US, UK, AU, CA, NZ, IE, ZA)" },
  { prefix: "978-2", name: "French language" },
  { prefix: "978-3", name: "German language" },
  { prefix: "978-4", name: "Japan" },
  { prefix: "978-5", name: "Former USSR / Russia" },
  { prefix: "978-600", name: "Iran" },
  { prefix: "978-601", name: "Kazakhstan" },
  { prefix: "978-602", name: "Indonesia" },
  { prefix: "978-603", name: "Saudi Arabia" },
  { prefix: "978-604", name: "Vietnam" },
  { prefix: "978-605", name: "Turkey" },
  { prefix: "978-606", name: "Romania" },
  { prefix: "978-607", name: "Mexico" },
  { prefix: "978-608", name: "North Macedonia" },
  { prefix: "978-609", name: "Lithuania" },
  { prefix: "978-611", name: "Thailand" },
  { prefix: "978-612", name: "Peru" },
  { prefix: "978-613", name: "Mauritius" },
  { prefix: "978-614", name: "Lebanon" },
  { prefix: "978-615", name: "Hungary" },
  { prefix: "978-616", name: "Thailand" },
  { prefix: "978-617", name: "Ukraine" },
  { prefix: "978-618", name: "Greece" },
  { prefix: "978-619", name: "Bulgaria" },
  { prefix: "978-620", name: "Mauritius" },
  { prefix: "978-621", name: "Philippines" },
  { prefix: "978-622", name: "Iran" },
  { prefix: "978-623", name: "Indonesia" },
  { prefix: "978-624", name: "Sri Lanka" },
  { prefix: "978-625", name: "Turkey" },
  { prefix: "978-626", name: "Taiwan" },
  { prefix: "978-627", name: "Pakistan" },
  { prefix: "978-628", name: "Colombia" },
  { prefix: "978-629", name: "Malaysia" },
  { prefix: "978-630", name: "Romania" },
  { prefix: "978-631", name: "Argentina" },
  { prefix: "978-65", name: "Brazil" },
  { prefix: "978-7", name: "China" },
  { prefix: "978-80", name: "Czechia / Slovakia" },
  { prefix: "978-81", name: "India" },
  { prefix: "978-82", name: "Norway" },
  { prefix: "978-83", name: "Poland" },
  { prefix: "978-84", name: "Spain" },
  { prefix: "978-85", name: "Brazil" },
  { prefix: "978-86", name: "Serbia / Montenegro / Croatia / Slovenia / Bosnia" },
  { prefix: "978-87", name: "Denmark" },
  { prefix: "978-88", name: "Italy" },
  { prefix: "978-89", name: "South Korea" },
  { prefix: "978-90", name: "Netherlands / Belgium (Dutch)" },
  { prefix: "978-91", name: "Sweden" },
  { prefix: "978-92", name: "International (UN, UNESCO)" },
  { prefix: "978-93", name: "India" },
  { prefix: "978-94", name: "Netherlands" },
  { prefix: "978-950", name: "Argentina" },
  { prefix: "978-951", name: "Finland" },
  { prefix: "978-952", name: "Finland" },
  { prefix: "978-953", name: "Croatia" },
  { prefix: "978-954", name: "Bulgaria" },
  { prefix: "978-955", name: "Sri Lanka" },
  { prefix: "978-956", name: "Chile" },
  { prefix: "978-957", name: "Taiwan" },
  { prefix: "978-958", name: "Colombia" },
  { prefix: "978-959", name: "Cuba" },
  { prefix: "978-960", name: "Greece" },
  { prefix: "978-961", name: "Slovenia" },
  { prefix: "978-962", name: "Hong Kong" },
  { prefix: "978-963", name: "Hungary" },
  { prefix: "978-964", name: "Iran" },
  { prefix: "978-965", name: "Israel" },
  { prefix: "978-966", name: "Ukraine" },
  { prefix: "978-967", name: "Malaysia" },
  { prefix: "978-968", name: "Mexico" },
  { prefix: "978-969", name: "Pakistan" },
  { prefix: "978-970", name: "Mexico" },
  { prefix: "978-971", name: "Philippines" },
  { prefix: "978-972", name: "Portugal" },
  { prefix: "978-973", name: "Romania" },
  { prefix: "978-974", name: "Thailand" },
  { prefix: "978-975", name: "Turkey" },
  { prefix: "978-976", name: "Caribbean Community" },
  { prefix: "978-977", name: "Egypt" },
  { prefix: "978-978", name: "Nigeria" },
  { prefix: "978-979", name: "Indonesia" },
  { prefix: "978-980", name: "Venezuela" },
  { prefix: "978-981", name: "Singapore" },
  { prefix: "978-982", name: "South Pacific" },
  { prefix: "978-983", name: "Malaysia" },
  { prefix: "978-984", name: "Bangladesh" },
  { prefix: "978-985", name: "Belarus" },
  { prefix: "978-986", name: "Taiwan" },
  { prefix: "978-987", name: "Argentina" },
  { prefix: "978-988", name: "Hong Kong" },
  { prefix: "978-989", name: "Portugal" },
  { prefix: "978-9927", name: "Qatar" },
  { prefix: "978-9928", name: "Albania" },
  { prefix: "978-9929", name: "Guatemala" },
  { prefix: "978-9930", name: "Costa Rica" },
  { prefix: "978-9931", name: "Algeria" },
  { prefix: "978-9932", name: "Palestine" },
  { prefix: "978-9933", name: "Syria" },
  { prefix: "978-9934", name: "Latvia" },
  { prefix: "978-9935", name: "Iceland" },
  { prefix: "978-9936", name: "Afghanistan" },
  { prefix: "978-9937", name: "Nepal" },
  { prefix: "978-9938", name: "Tunisia" },
  { prefix: "978-9939", name: "Armenia" },
  { prefix: "978-9940", name: "Montenegro" },
  { prefix: "978-9941", name: "Georgia" },
  { prefix: "978-9942", name: "Ecuador" },
  { prefix: "978-9943", name: "Uzbekistan" },
  { prefix: "978-9944", name: "Turkey" },
  { prefix: "978-9945", name: "Dominican Republic" },
  { prefix: "978-9946", name: "North Korea" },
  { prefix: "978-9947", name: "Algeria" },
  { prefix: "978-9948", name: "United Arab Emirates" },
  { prefix: "978-9949", name: "Estonia" },
  { prefix: "978-9950", name: "Palestine" },
  { prefix: "978-9951", name: "Kosovo" },
  { prefix: "978-9952", name: "Azerbaijan" },
  { prefix: "978-9953", name: "Lebanon" },
  { prefix: "978-9954", name: "Morocco" },
  { prefix: "978-9955", name: "Lithuania" },
  { prefix: "978-9956", name: "Cameroon" },
  { prefix: "978-9957", name: "Jordan" },
  { prefix: "978-9958", name: "Bosnia and Herzegovina" },
  { prefix: "978-9959", name: "Libya" },
  { prefix: "978-9960", name: "Saudi Arabia" },
  { prefix: "978-9961", name: "Algeria" },
  { prefix: "978-9962", name: "Panama" },
  { prefix: "978-9963", name: "Cyprus" },
  { prefix: "978-9964", name: "Ghana" },
  { prefix: "978-9965", name: "Kazakhstan" },
  { prefix: "978-9966", name: "Kenya" },
  { prefix: "978-9967", name: "Kyrgyzstan" },
  { prefix: "978-9968", name: "Costa Rica" },
  { prefix: "978-9970", name: "Uganda" },
  { prefix: "978-9971", name: "Singapore" },
  { prefix: "978-9972", name: "Peru" },
  { prefix: "978-9973", name: "Tunisia" },
  { prefix: "978-9974", name: "Uruguay" },
  { prefix: "978-9975", name: "Moldova" },
  { prefix: "978-9976", name: "Tanzania" },
  { prefix: "978-9977", name: "Costa Rica" },
  { prefix: "978-9978", name: "Ecuador" },
  { prefix: "978-9979", name: "Iceland" },
  { prefix: "978-9980", name: "Papua New Guinea" },
  { prefix: "978-9981", name: "Morocco" },
  { prefix: "978-9982", name: "Zambia" },
  { prefix: "978-9983", name: "Gambia" },
  { prefix: "978-9984", name: "Latvia" },
  { prefix: "978-9985", name: "Estonia" },
  { prefix: "978-9986", name: "Lithuania" },
  { prefix: "978-9987", name: "Tanzania" },
  { prefix: "978-9988", name: "Ghana" },
  { prefix: "978-9989", name: "North Macedonia" },
  { prefix: "978-99901", name: "Bahrain" },
  { prefix: "978-99902", name: "Reserved" },
  { prefix: "978-99903", name: "Mauritius" },
  { prefix: "978-99904", name: "Curaçao" },
  { prefix: "978-99905", name: "Bolivia" },
  { prefix: "978-99906", name: "Kuwait" },
  { prefix: "978-99908", name: "Malawi" },
  { prefix: "978-99909", name: "Malta" },
  { prefix: "978-99910", name: "Sierra Leone" },
  { prefix: "978-99911", name: "Lesotho" },
  { prefix: "978-99912", name: "Botswana" },
  { prefix: "978-99913", name: "Andorra" },
  { prefix: "978-99914", name: "Suriname" },
  { prefix: "978-99915", name: "Maldives" },
  { prefix: "978-99916", name: "Namibia" },
  { prefix: "978-99917", name: "Brunei" },
  { prefix: "978-99918", name: "Faroe Islands" },
  { prefix: "978-99919", name: "Benin" },
  { prefix: "978-99920", name: "Andorra" },
  { prefix: "978-99921", name: "Qatar" },
  { prefix: "978-99922", name: "Guatemala" },
  { prefix: "978-99923", name: "El Salvador" },
  { prefix: "978-99924", name: "Nicaragua" },
  { prefix: "978-99925", name: "Paraguay" },
  { prefix: "978-99926", name: "Honduras" },
  { prefix: "978-99927", name: "Albania" },
  { prefix: "978-99928", name: "Georgia" },
  { prefix: "978-99929", name: "Mongolia" },
  { prefix: "978-99930", name: "Armenia" },
  { prefix: "978-99931", name: "Seychelles" },
  { prefix: "978-99932", name: "Malta" },
  { prefix: "978-99933", name: "Nepal" },
  { prefix: "978-99934", name: "Dominican Republic" },
  { prefix: "978-99935", name: "Haiti" },
  { prefix: "978-99936", name: "Bhutan" },
  { prefix: "978-99937", name: "Macau" },
  { prefix: "978-99938", name: "Srpska (Bosnia)" },
  { prefix: "978-99939", name: "Guatemala" },
  { prefix: "978-99940", name: "Georgia" },
  { prefix: "978-99941", name: "Armenia" },
  { prefix: "978-99942", name: "Sudan" },
  { prefix: "978-99943", name: "Albania" },
  { prefix: "978-99944", name: "Ethiopia" },
  { prefix: "978-99945", name: "Namibia" },
  { prefix: "978-99946", name: "Nepal" },
  { prefix: "978-99947", name: "Tajikistan" },
  { prefix: "978-99948", name: "Eritrea" },
  { prefix: "978-99949", name: "Mauritius" },
  { prefix: "978-99950", name: "Cambodia" },
  { prefix: "978-99951", name: "Reserved" },
  { prefix: "978-99952", name: "Mali" },
  { prefix: "978-99953", name: "Paraguay" },
  { prefix: "978-99954", name: "Bolivia" },
  { prefix: "978-99955", name: "Srpska (Bosnia)" },
  { prefix: "978-99956", name: "Bosnia and Herzegovina" },
  { prefix: "978-99957", name: "Malta" },
  { prefix: "978-99958", name: "Bahrain" },
  { prefix: "978-99959", name: "Luxembourg" },
  { prefix: "978-99960", name: "Malawi" },
  { prefix: "978-99961", name: "El Salvador" },
  { prefix: "978-99962", name: "Mongolia" },
  { prefix: "978-99963", name: "Cambodia" },
  { prefix: "978-99964", name: "Nicaragua" },
  { prefix: "978-99965", name: "Macau" },
  { prefix: "978-99966", name: "Kuwait" },
  { prefix: "978-99967", name: "Paraguay" },
  { prefix: "978-99968", name: "Botswana" },
  { prefix: "978-99969", name: "Oman" },
  { prefix: "978-99970", name: "Haiti" },
  { prefix: "978-99971", name: "Myanmar" },
  { prefix: "978-99972", name: "Faroe Islands" },
  { prefix: "978-99973", name: "Mongolia" },
  { prefix: "978-99974", name: "Bolivia" },
  { prefix: "978-99975", name: "Tajikistan" },
  { prefix: "978-99976", name: "Srpska (Bosnia)" },
  { prefix: "978-99977", name: "Rwanda" },
  { prefix: "978-99978", name: "Mongolia" },
  { prefix: "978-99979", name: "Honduras" },
  { prefix: "978-99980", name: "Bhutan" },
  { prefix: "978-99981", name: "Macau" },
  { prefix: "978-99982", name: "Bangladesh" },
  { prefix: "978-99983", name: "El Salvador" },
  { prefix: "978-99984", name: "Sudan" },
  { prefix: "978-99985", name: "Tajikistan" },
  { prefix: "979-10", name: "France" },
  { prefix: "979-11", name: "South Korea" },
  { prefix: "979-12", name: "Italy" },
  { prefix: "979-8", name: "United States" },
];

// Sort by prefix length descending so the longest match wins
const SORTED_GROUPS = [...GROUPS].sort((a, b) => b.prefix.length - a.prefix.length);

/** Identify the registration group / country for an ISBN-13. */
export function identifyGroup(isbn13: string): { prefix: string; name: string } | null {
  const n = normalize(isbn13);
  if (n.length !== 13) return null;
  const hyphenated = n.slice(0, 3) + "-" + n.slice(3); // 978-xxxxxxxxxx
  for (const g of SORTED_GROUPS) {
    if (hyphenated.startsWith(g.prefix)) return g;
  }
  return null;
}

/** Add hyphens between EAN prefix, registration group, and check digit. */
export function formatISBN13(isbn13: string): string {
  const n = normalize(isbn13);
  if (n.length !== 13) return n;
  const g = identifyGroup(n);
  if (!g) return `${n.slice(0, 3)}-${n.slice(3, 12)}-${n.slice(12)}`;
  const groupDigits = g.prefix.split("-")[1] ?? "";
  return `${n.slice(0, 3)}-${groupDigits}-${n.slice(3 + groupDigits.length, 12)}-${n.slice(12)}`;
}

export function formatISBN10(isbn10: string): string {
  const n = normalize(isbn10);
  if (n.length !== 10) return n;
  return `${n.slice(0, 1)}-${n.slice(1, 4)}-${n.slice(4, 9)}-${n.slice(9)}`;
}

/** Full validation with derived info. */
export function validate(raw: string): ValidationResult {
  const norm = normalize(raw);
  if (!norm) return { input: raw, normalized: "", type: "invalid", valid: false, reason: "Empty input" };

  if (norm.length === 10) {
    const valid = isValidISBN10(norm);
    if (!valid) {
      const expected = /^\d{9}$/.test(norm.slice(0, 9)) ? checkDigit10(norm.slice(0, 9)) : null;
      return {
        input: raw, normalized: norm, type: "ISBN-10", valid: false,
        reason: expected ? `Invalid check digit (expected ${expected}, got ${norm[9]})` : "Invalid format",
      };
    }
    const isbn13 = to13(norm);
    const g = identifyGroup(isbn13);
    return {
      input: raw, normalized: norm, type: "ISBN-10", valid: true,
      format: formatISBN10(norm), isbn10: norm, isbn13,
      registrationGroup: g?.prefix, countryOrLanguage: g?.name,
    };
  }

  if (norm.length === 13) {
    const valid = isValidISBN13(norm);
    if (!valid) {
      let reason = "Invalid check digit";
      if (!(norm.startsWith("978") || norm.startsWith("979"))) {
        reason = "ISBN-13 must start with 978 or 979";
      } else if (/^\d{12}$/.test(norm.slice(0, 12))) {
        reason = `Invalid check digit (expected ${checkDigit13(norm.slice(0, 12))}, got ${norm[12]})`;
      }
      return { input: raw, normalized: norm, type: "ISBN-13", valid: false, reason };
    }
    const isbn10 = to10(norm);
    const g = identifyGroup(norm);
    return {
      input: raw, normalized: norm, type: "ISBN-13", valid: true,
      format: formatISBN13(norm), isbn13: norm, isbn10: isbn10 ?? undefined,
      registrationGroup: g?.prefix, countryOrLanguage: g?.name,
    };
  }

  return { input: raw, normalized: norm, type: "invalid", valid: false, reason: `Length ${norm.length} — must be 10 or 13 digits` };
}

/** Parse multi-line/CSV input into ISBN candidates. */
export function parseBulk(text: string): string[] {
  return text
    .split(/[\r\n,;\t]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Find duplicate ISBNs (comparing normalized ISBN-13). Returns groups of >=2. */
export function findDuplicates(list: string[]): { key: string; entries: { raw: string; index: number }[] }[] {
  const map = new Map<string, { raw: string; index: number }[]>();
  list.forEach((raw, index) => {
    const v = validate(raw);
    const key = v.valid ? (v.isbn13 || v.normalized) : "";
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ raw, index });
  });
  return Array.from(map.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => ({ key, entries }));
}

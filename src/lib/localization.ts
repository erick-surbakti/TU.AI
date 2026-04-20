/**
 * @fileOverview ASEAN Localization utility for TUAI.
 * 
 * Provides country-specific configurations like currencies, political context,
 * and regional names to tailor the AI and UI experience.
 */

export interface CountryConfig {
  name: string;
  code: string;
  currency: {
    symbol: string;
    code: string;
    decimalSeparator: string;
    thousandsSeparator: string;
    symbolOnLeft: boolean;
  };
  leaderTitle: string; // President, Prime Minister, etc.
  regionType: string; // Province, State, Division, etc.
  capitalCoords: { lat: number; lng: number };
}

export const ASEAN_COUNTRIES: Record<string, CountryConfig> = {
  BN: {
    name: "Brunei",
    code: "BN",
    currency: { symbol: "B$", code: "BND", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: true },
    leaderTitle: "Sultan",
    regionType: "District",
    capitalCoords: { lat: 4.8902, lng: 114.9404 },
  },
  KH: {
    name: "Cambodia",
    code: "KH",
    currency: { symbol: "៛", code: "KHR", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: false },
    leaderTitle: "Prime Minister",
    regionType: "Province",
    capitalCoords: { lat: 11.5449, lng: 104.8922 },
  },
  ID: {
    name: "Indonesia",
    code: "ID",
    currency: { symbol: "Rp", code: "IDR", decimalSeparator: ",", thousandsSeparator: ".", symbolOnLeft: true },
    leaderTitle: "President",
    regionType: "Province",
    capitalCoords: { lat: -6.2088, lng: 106.8456 },
  },
  LA: {
    name: "Laos",
    code: "LA",
    currency: { symbol: "₭", code: "LAK", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: false },
    leaderTitle: "President",
    regionType: "Province",
    capitalCoords: { lat: 17.9757, lng: 102.6331 },
  },
  MY: {
    name: "Malaysia",
    code: "MY",
    currency: { symbol: "RM", code: "MYR", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: true },
    leaderTitle: "Prime Minister",
    regionType: "State",
    capitalCoords: { lat: 3.1390, lng: 101.6869 },
  },
  MM: {
    name: "Myanmar",
    code: "MM",
    currency: { symbol: "K", code: "MMK", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: true },
    leaderTitle: "Prime Minister",
    regionType: "State/Region",
    capitalCoords: { lat: 19.7633, lng: 96.0785 },
  },
  PH: {
    name: "Philippines",
    code: "PH",
    currency: { symbol: "₱", code: "PHP", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: true },
    leaderTitle: "President",
    regionType: "Province",
    capitalCoords: { lat: 14.5995, lng: 120.9842 },
  },
  SG: {
    name: "Singapore",
    code: "SG",
    currency: { symbol: "S$", code: "SGD", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: true },
    leaderTitle: "Prime Minister",
    regionType: "Planning Area",
    capitalCoords: { lat: 1.3521, lng: 103.8198 },
  },
  TH: {
    name: "Thailand",
    code: "TH",
    currency: { symbol: "฿", code: "THB", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: true },
    leaderTitle: "Prime Minister",
    regionType: "Province",
    capitalCoords: { lat: 13.7563, lng: 100.5018 },
  },
  VN: {
    name: "Vietnam",
    code: "VN",
    currency: { symbol: "₫", code: "VND", decimalSeparator: ".", thousandsSeparator: ",", symbolOnLeft: false },
    leaderTitle: "President",
    regionType: "Province",
    capitalCoords: { lat: 21.0285, lng: 105.8542 },
  },
};

/**
 * Formats a number as a localized currency string based on the country code.
 */
export function formatCurrency(amount: number, countryCode: string = "MY"): string {
  const config = ASEAN_COUNTRIES[countryCode] || ASEAN_COUNTRIES["MY"];
  const { symbol, decimalSeparator, thousandsSeparator, symbolOnLeft } = config.currency;
  
  const parts = amount.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  const formattedAmount = parts.join(decimalSeparator);
  
  return symbolOnLeft ? `${symbol}${formattedAmount}` : `${formattedAmount}${symbol}`;
}

/**
 * Gets political/regional context for AI prompts.
 */
export function getRegionalContext(countryCode: string = "MY") {
  const config = ASEAN_COUNTRIES[countryCode] || ASEAN_COUNTRIES["MY"];
  return {
    countryName: config.name,
    leaderTitle: config.leaderTitle,
    regionType: config.regionType,
  };
}

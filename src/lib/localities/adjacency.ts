import { COUNTIES, COUNTY_BY_CODE } from "@/lib/localities/counties";

/**
 * Județele vecine (graniță terestră) pentru fiecare județ, pe cod.
 * Folosit la recomandările de furnizori: dacă evenimentele nunții sunt în mai
 * multe județe, recomandăm furnizori din județele respective ȘI din cele
 * apropiate (vecine).
 */
export const COUNTY_NEIGHBORS: Record<string, string[]> = {
  AB: ["BH", "AR", "HD", "VL", "SB", "MS", "CJ"],
  AR: ["TM", "HD", "AB", "BH", "CS"],
  AG: ["VL", "SB", "BV", "DB", "TR", "OT"],
  BC: ["NT", "HR", "CV", "VN", "VS"],
  BH: ["SM", "SJ", "CJ", "AB", "AR"],
  BN: ["MM", "SV", "MS", "CJ", "SJ"],
  BT: ["SV", "IS"],
  BV: ["CV", "HR", "MS", "SB", "AG", "DB", "PH", "BZ"],
  BR: ["GL", "VN", "BZ", "IL", "CT", "TL"],
  BZ: ["BR", "VN", "CV", "BV", "PH", "IL"],
  CS: ["TM", "AR", "HD", "GJ", "MH"],
  CL: ["IL", "IF", "GR", "CT"],
  CJ: ["BH", "SJ", "BN", "MS", "AB", "MM"],
  CT: ["TL", "IL", "CL", "BR"],
  CV: ["BV", "HR", "BC", "VN", "BZ"],
  DB: ["AG", "PH", "IF", "GR", "TR", "BV"],
  DJ: ["MH", "GJ", "VL", "OT"],
  GL: ["BR", "VN", "VS", "TL"],
  GR: ["TR", "DB", "IF", "CL"],
  GJ: ["MH", "CS", "HD", "VL", "DJ"],
  HR: ["SV", "NT", "BC", "CV", "BV", "MS"],
  HD: ["AR", "AB", "VL", "GJ", "CS", "TM"],
  IL: ["CL", "IF", "PH", "BZ", "BR", "CT", "DB"],
  IS: ["BT", "SV", "NT", "VS"],
  IF: ["B", "DB", "PH", "IL", "CL", "GR"],
  MM: ["SM", "SJ", "CJ", "BN", "SV"],
  MH: ["CS", "GJ", "DJ"],
  MS: ["CJ", "BN", "HR", "BV", "SB", "AB"],
  NT: ["SV", "IS", "BC", "HR"],
  OT: ["VL", "AG", "TR", "DJ"],
  PH: ["DB", "BV", "BZ", "IL", "IF"],
  SM: ["MM", "SJ", "BH"],
  SJ: ["SM", "MM", "CJ", "BN", "BH"],
  SB: ["AB", "MS", "BV", "AG", "VL"],
  SV: ["BT", "IS", "NT", "HR", "MM", "BN"],
  TR: ["OT", "AG", "DB", "GR"],
  TM: ["AR", "HD", "CS"],
  TL: ["CT", "BR", "GL"],
  VS: ["IS", "BC", "VN", "GL"],
  VL: ["AB", "SB", "AG", "OT", "DJ", "GJ", "HD"],
  VN: ["BC", "CV", "BZ", "BR", "GL", "VS"],
  B: ["IF"],
};

/** Codurile de județ + vecinii lor (dedup), pentru extinderea „apropiate". */
export function nearbyCountyCodes(codes: string[]): string[] {
  const set = new Set<string>();
  for (const code of codes) {
    if (!code) continue;
    set.add(code);
    for (const n of COUNTY_NEIGHBORS[code] ?? []) set.add(n);
  }
  return [...set];
}

const NAME_TO_CODE = new Map(COUNTIES.map((c) => [c.name, c.code]));

/**
 * Nume de județe + numele vecinilor lor. Furnizorii stochează `regions` ca nume
 * de județ, deci recomandările lucrează pe nume, nu pe coduri.
 */
export function nearbyCountyNames(names: string[]): string[] {
  const codes = names
    .map((n) => NAME_TO_CODE.get(n))
    .filter((c): c is string => !!c);
  return nearbyCountyCodes(codes)
    .map((code) => COUNTY_BY_CODE.get(code)?.name)
    .filter((n): n is string => !!n);
}

// Conditional result arms remain type-only in pure mode.
// Their global names cause no runtime imports or substitutions.
declare const matched: string extends string ? Number : boolean;
declare const unmatched: string extends boolean ? boolean : Map<string, number>;
export { matched, unmatched };

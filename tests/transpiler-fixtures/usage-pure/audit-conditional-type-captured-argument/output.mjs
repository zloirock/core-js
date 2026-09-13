// Conditional annotation flow alone causes no pure runtime substitution.
// The captured Set and the comparison-only Map and Number all remain type-only.
declare const value: Map<string, Set<number>> extends Map<string, infer Captured> ? Captured : never;
declare const unused: Number extends infer Captured ? string : boolean;
export { value, unused };
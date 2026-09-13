// Conditional result arms describe values that may flow through the annotation.
// Their globals retain the normal usage-global annotation injection policy.
declare const matched: string extends string ? Number : boolean;
declare const unmatched: string extends boolean ? boolean : Map<string, number>;
export { matched, unmatched };

import "core-js/modules/es.array.includes";
// cast-wrapped destructure-LHS slots are per-slot writes too - raw on both parsers, while
// independent reads of the same receivers keep the polyfill
const g1: number[] = [1];
export const r6 = g1.includes(1);
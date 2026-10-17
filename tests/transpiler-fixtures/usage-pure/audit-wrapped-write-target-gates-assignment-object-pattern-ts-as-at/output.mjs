// cast-wrapped destructure-LHS slots are per-slot writes too - raw on both parsers, while
// independent reads of the same receivers keep the polyfill
const g1: number[] = [1];
({
  p: g1.at as any
} = {
  p: 1
});
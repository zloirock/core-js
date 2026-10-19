// Tuple `[...string[], number]` indexed past the leading rest has ambiguous element type.
// Element resolution must bail so dispatch falls back to the generic instance polyfill.
type LeadingRest = [...string[], number];
declare const t: LeadingRest;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
t[0].at(0);

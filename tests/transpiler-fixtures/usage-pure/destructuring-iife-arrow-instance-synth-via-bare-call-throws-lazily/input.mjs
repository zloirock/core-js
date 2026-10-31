// An IIFE's sole call supplies its parameter's receiver mirror.
// Each receiver evaluates once; method reads preserve the parameter's evaluation order.
// Literal receivers select typed dispatchers; unknown receivers keep the generic dispatcher.
// The throwing case stays inside an exported function so module evaluation reaches every row.
export const viaBareCallThrowsLazily = () => (({ includes }) => includes("x"))(arr);

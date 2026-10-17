// A cast-wrapped object-pattern target writes the array property.
// Assigning at must not request its polyfill.
const g1: number[] = [1];
({ p: (g1.at as any) } = { p: 1 });

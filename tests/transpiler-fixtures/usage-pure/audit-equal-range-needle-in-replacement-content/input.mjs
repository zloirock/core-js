// Equal-range merge sanity: arrow body wrapper + inner polyfill share [start, end]
// Compose layer must merge wrapper text containing needle exactly once into inner content
const f = x => Array.from(x).at(-1);
const g = x => Array.from(x).flat().at(-1);

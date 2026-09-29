// A mixed initializer retains its finite receiver union.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = { data: flag ? [10, 20] : "1020" };
export const result = box.data.includes("02");

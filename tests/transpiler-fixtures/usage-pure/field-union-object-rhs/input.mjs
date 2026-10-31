// Alternatives inside a field write join the initializer family.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = { data: null };
box.data = flag ? [10, 20] : "1020";
export const result = box.data.includes("02");

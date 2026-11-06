// Alternatives inside a field write join the initializer family.
const box = { data: null };
box.data = flag ? [10, 20] : "1020";
export const result = box.data.includes("02");

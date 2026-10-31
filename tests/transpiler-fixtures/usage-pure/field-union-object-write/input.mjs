// Writes to one field retain both receiver families.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = { data: [10, 20] };
box.data = "1020";
export const result = box.data.includes("02");

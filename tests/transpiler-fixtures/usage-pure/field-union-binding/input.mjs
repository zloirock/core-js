// A stable extracted field retains its receiver union.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = { data: [10, 20] };
box.data = "1020";
const { data } = box;
export const result = data.includes("02");

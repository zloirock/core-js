// A stable extracted field retains its receiver union.
const box = { data: [10, 20] };
box.data = "1020";
const { data } = box;
export const result = data.includes("02");

// A mixed initializer retains its finite receiver union.
const box = { data: flag ? [10, 20] : "1020" };
export const result = box.data.includes("02");

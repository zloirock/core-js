// One unresolved alternative keeps the full includes dispatch set.
const box = { data: [10, 20] };
box.data = flag ? "1020" : foreign;
export const result = box.data.includes("02");

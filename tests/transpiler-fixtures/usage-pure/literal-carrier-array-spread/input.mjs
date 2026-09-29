// An array spread exposes the objects stored in the array.
const box = { data: [10, 20] };
const [alias] = [...[box]];
alias.data = "1020";
export const result = box.data.includes("02");

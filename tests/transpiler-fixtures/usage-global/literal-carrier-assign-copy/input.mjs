// Copying a carrier with Object.assign preserves its reference to the held object.
const box = { data: [10, 20] };
const { box: alias } = Object.assign({}, { box });
alias.data = "1020";
export const result = box.data.includes("02");

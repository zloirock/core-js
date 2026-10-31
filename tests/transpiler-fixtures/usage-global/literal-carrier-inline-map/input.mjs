// A method called on a temporary carrier can return its elements for later mutation.
const box = { data: [10, 20] };
const [alias] = [box].map(value => value);
alias.data = "1020";
export const result = box.data.includes("02");

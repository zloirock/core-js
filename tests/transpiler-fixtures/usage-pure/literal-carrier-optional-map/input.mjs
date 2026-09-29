// Optional method calls can expose carrier elements even after the call becomes a guard.
const box = { data: [10, 20] };
const [alias] = [box]?.map(value => value);
alias.data = "1020";
export const result = box.data.includes("02");

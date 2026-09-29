// Nested extraction reads the same field union as direct member access.
const box = { data: [10, 20] };
box.data = "1020";
const { data: { includes } } = box;
export const result = includes.call("1020", "02");

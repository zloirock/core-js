// Nested extraction reads the same field union as direct member access.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = { data: [10, 20] };
box.data = "1020";
const { data: { includes } } = box;
export const result = includes.call("1020", "02");

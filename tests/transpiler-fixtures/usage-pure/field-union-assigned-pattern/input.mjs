// Destructuring assignments retain the field union and need only String includes.
const box = { data: Math };
box.data = "1020";
let data = Math;
({ data } = box);
export const result = data.includes("02");

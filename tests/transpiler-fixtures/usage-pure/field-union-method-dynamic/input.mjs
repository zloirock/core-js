// Enumerated writes preserve Function/String alternatives; only String includes is needed.
class Box { data() {} }
const box = new Box();
const key = "data";
box[key] = "1020";
export const result = box.data.includes("02");

// Enumerated writes preserve Function/String alternatives; only String includes is needed.
class Box { static data() {} }
const box = Box;
box.change = function () { this.data = "1020"; };
box.change();
export const result = box.data.includes("02");

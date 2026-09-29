// Instance writes retain their families alongside the class initializer.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
class Box { data = [10, 20]; }
const box = new Box();
box.data = "1020";
export const result = box.data.includes("02");

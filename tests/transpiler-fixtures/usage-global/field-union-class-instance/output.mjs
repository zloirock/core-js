import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// Instance writes retain their families alongside the class initializer.
class Box {
  data = [10, 20];
}
const box = new Box();
box.data = "1020";
export const result = box.data.includes("02");
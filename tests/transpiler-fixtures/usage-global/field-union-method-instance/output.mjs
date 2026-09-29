import "core-js/modules/es.array.includes";
// A callable initializer does not prove that later slot values remain functions.
class Box {
  data() {}
}
const box = new Box();
box.data = [10, 20];
export const result = box.data.includes("02");
import "core-js/modules/es.string.includes";
// A callable initializer does not prove that later slot values remain functions.
const box = {
  data: () => 1
};
box.data = "1020";
export const result = box.data.includes("02");
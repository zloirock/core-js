import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// A stable extracted field retains its receiver union.
const box = {
  data: [10, 20]
};
box.data = "1020";
const {
  data
} = box;
export const result = data.includes("02");
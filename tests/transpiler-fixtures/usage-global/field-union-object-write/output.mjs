import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// Writes to one field retain both receiver families.
const box = {
  data: [10, 20]
};
box.data = "1020";
export const result = box.data.includes("02");
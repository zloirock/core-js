import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// Own method writes contribute to the field union read through this.
const box = {
  data: [10, 20],
  change() {
    this.data = "1020";
  },
  read() {
    return this.data.includes("02");
  }
};
box.change();
export const result = box.read();
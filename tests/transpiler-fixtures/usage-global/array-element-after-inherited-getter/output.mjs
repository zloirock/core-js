import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Reading an inherited getter can replace the array element before at is called.
const rows = ['word'];
Object.defineProperty(Array.prototype, 'slotProbe', {
  configurable: true,
  get() {
    this[0] = [7];
  }
});
void rows.slotProbe;
export const first = rows[0].at(0);
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Reading an inherited getter can replace the array element before at is called.
const rows = ['word'];
Object.defineProperty(Array.prototype, 'slotProbe', {
  configurable: true,
  get() {
    this[0] = [7];
  }
});
void rows.slotProbe;
export const first = _at(_ref = rows[0]).call(_ref, 0);
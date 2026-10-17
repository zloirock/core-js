import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
// A known instance caller reads its method when the parameter consumes the slot.
// Every later argument finishes before the method read.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const events = [];
function own() {
  return 'own';
}
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() {
    events.push('get');
    return own;
  }
});
function read({
  at
}, value) {
  return at;
}
export const result = read([1], events.push('argument'));
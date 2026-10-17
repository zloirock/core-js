// An earlier property default runs before a known caller reads its instance method.
// Both reads stay in their parameter-pattern order.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const events = [];
function own() { return 'own'; }
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() { events.push('get'); return own; },
});
function read({ missing = events.push('default'), at }) { return at; }
export const result = read([2]);

// Independent patterns of one caller argument retain their method getter order.
// Both instance reads happen when the parameter consumes its own array position.
// A foreign prototype handout leaves the iterator and its yielded receiver families open.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const priorAt = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
const priorFlat = Object.getOwnPropertyDescriptor(Array.prototype, 'flat');
const events = [];
function ownAt() { return 'at'; }
function ownFlat() { return 'flat'; }
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() { events.push('at'); return ownAt; },
});
restoreProperty(Array.prototype, 'flat', {
  configurable: true,
  get() { events.push('flat'); return ownFlat; },
});
export let result;
try {
  result = (([{ at }, { flat }]) => [at, flat])([[1], [[2]]]);
} finally {
  restoreProperty(Array.prototype, 'at', priorAt);
  restoreProperty(Array.prototype, 'flat', priorFlat);
}

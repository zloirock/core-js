// Instance and symbol getters run when the parameter consumes each slot.
// A symbol lookup after an instance leaf must not advance ahead of that leaf.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const key = Symbol.iterator;
const priorAt = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
const priorIterator = Object.getOwnPropertyDescriptor(Array.prototype, key);
const events = [];
function ownAt() { return 'at'; }
function ownIterator() { return 'iterator'; }
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() { events.push('at'); return ownAt; },
});
restoreProperty(Array.prototype, key, {
  configurable: true,
  get() { events.push('iterator'); return ownIterator; },
});
export let result;
try {
  result = (function ({ at, [key]: iterator } = [1, 2]) { return [at, iterator]; })();
} finally {
  restoreProperty(Array.prototype, 'at', priorAt);
  restoreProperty(Array.prototype, key, priorIterator);
}

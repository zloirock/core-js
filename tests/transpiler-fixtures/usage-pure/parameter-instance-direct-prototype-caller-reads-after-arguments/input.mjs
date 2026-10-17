// A direct caller captures its prototype receiver before later arguments run.
// Its instance getter stays at the original parameter read.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const prior = Object.getOwnPropertyDescriptor(Array.prototype, 'includes');
const events = [];
function own() { return 'includes'; }
restoreProperty(Array.prototype, 'includes', {
  configurable: true,
  get() { events.push('includes'); return own; },
});
export let result;
try {
  result = (({ includes }, other) => [includes, other])(Array.prototype, events.push('argument'));
} finally {
  restoreProperty(Array.prototype, 'includes', prior);
}

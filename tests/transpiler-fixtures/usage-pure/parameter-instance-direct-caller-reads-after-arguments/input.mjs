// A direct caller keeps an instance read after all argument evaluations.
// The string literal receiver is captured before its method getter runs.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const prior = Object.getOwnPropertyDescriptor(String.prototype, 'at');
const events = [];
function own() { return 'at'; }
restoreProperty(String.prototype, 'at', {
  configurable: true,
  get() { events.push('at'); return own; },
});
export let result;
try {
  result = (({ at }, other) => [typeof at, other])('az', events.push('argument'));
} finally {
  restoreProperty(String.prototype, 'at', prior);
}

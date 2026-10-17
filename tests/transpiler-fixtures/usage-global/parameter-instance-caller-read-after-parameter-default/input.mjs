// An earlier parameter default runs before a known caller reads its instance method.
// The method read follows that default and precedes the original function body.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const events = [];
function own() { return 'own'; }
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() { events.push('get'); return own; },
});
function read(value = events.push('parameter-default'), { at }) { return [at, value]; }
export const result = read(undefined, [3]);

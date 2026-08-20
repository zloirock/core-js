import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.at";
import "core-js/modules/web.dom-collections.values";
// re-export form (`export { x } from '...' with { type: 'json' }`) and dynamic-import form
// (`await import('...', { with: { type: 'json' } })`) - both preserve the with-clause
// through transformation; downstream `.at(-1)` on the dynamic-import result triggers the
// usual usage detection
export { entries } from './data.json' with { type: 'json' };
async function load() {
  const m = await import('./other.json', {
    with: {
      type: 'json'
    }
  });
  return m.values.at(-1);
}
load();
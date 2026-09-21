import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested literal spreads retain exact positions, including empty arrays and holes.
// Both destructuring and caller arguments must select their own static receiver.
const [{
  values
}] = [...[...[Object]]];
const [, {
  from
}] = [...[...[],, ...[Array]]];
const entries = (({
  entries: read
}) => read)(...[...[Object]]);
export { values, from, entries };
for (const {
  of: read
} of [...[...[(effect(), Array)]]]) read(7);
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.values";
// Moving the loop pattern keeps the declaration before its later assignment.
export function collect(forms) {
  const seen = [];
  for (const {
    values,
    meta
  } of forms) {
    let entries, status;
    ({
      data: {
        entries
      },
      status
    } = meta);
    seen.push(values, entries, status);
  }
  return seen;
}
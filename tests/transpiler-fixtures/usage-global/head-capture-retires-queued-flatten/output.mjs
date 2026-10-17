import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a static beside a nested instance leaf over a loop-head binding: the static's retained capture
// replaces the declarator the leaf's flatten was queued on, so the flatten renders once, off the
// capture - never a second copy of the pair beside it (a duplicate declaration and a dangling ref)
const out = [];
for (const R of [Array]) {
  const {
    prototype: {
      at,
      length
    },
    from
  } = R;
  out.push(at, length, from);
}
export { out };
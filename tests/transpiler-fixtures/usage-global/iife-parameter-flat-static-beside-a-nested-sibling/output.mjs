import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A flat static of an IIFE parameter mirrors the call's argument, as the pattern without its nested
// sibling does: the argument is the receiver every slot reads, so the sibling's slot passes through.
// An expression body has no statement to extract into, a sibling's own default and an array level
// nest the same way, and a selection the build decides mirrors the operand that runs.
(function ({
  trunc,
  deep: {
    a
  }
}) {
  use(trunc, a);
})(Math);
(({
  of,
  list: [x]
}) => use(of, x))(Array);
(function ({
  fromEntries,
  deep: {
    b
  } = {}
}) {
  use(fromEntries, b);
})(globalThis.Object || Fallback);
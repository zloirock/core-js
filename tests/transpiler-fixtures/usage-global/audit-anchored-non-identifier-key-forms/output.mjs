import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// the ctor-key anchor route is a usage-pure rewrite, so tightening its key gate to identifier-valid
// names must leave this method's decision alone: every key shape below - folded well-known symbol,
// dashed and dotted strings, `$` and Unicode identifiers, a real constructor - still contributes its
// own detection, and the source is not rewritten at all
const {
  [Symbol.iterator]: {
    name: iterName
  }
} = globalThis;
const {
  'App-Key': {
    assign
  }
} = globalThis;
const {
  [`A.b`]: {
    flat
  }
} = globalThis.window?.self;
const {
  A$b: {
    from
  }
} = globalThis;
const {
  Abé: {
    token
  }
} = globalThis;
const {
  Map: {
    groupBy
  }
} = globalThis;
console.log(iterName, assign, flat, from, token, groupBy);
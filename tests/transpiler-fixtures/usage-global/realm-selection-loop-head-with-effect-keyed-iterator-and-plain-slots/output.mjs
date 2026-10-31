import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// An iterator claim and a plain slot, each keyed by an effect, in a loop head over a realm selection: the
// iterator key loads its symbol beside both realm roots, the plain one nothing.
let done;
for (const {
  [(k(), Symbol.iterator)]: it5,
  [(k2(), 'x')]: x5
} = c ? globalThis : self; !done;) done = 1;
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
import "core-js/modules/web.dom-collections.keys";
import "core-js/modules/web.dom-collections.values";
// a `var` a loop body, a block, a catch body, a switch case or a loop head declares is the function's
// binding, so a write to it outside that scope - here a closure's - reaches a read inside it: each read
// takes both values' families. the closure's constructions load the Set and Map families, and each read
// every family its member has; distinct member per line
export function f(c) {
  while (c) {
    var a = 'abc';
    w();
    use(a.at(-1));
  }
  {
    var b = 'abc';
    w();
    use(b.includes('a'));
  }
  try {
    g();
  } catch {
    var d = [1];
    w();
    use(d.values());
  }
  switch (c) {
    case 1:
      var e = [1];
      w();
      use(e.keys());
  }
  for (var h = [1]; c;) {
    w();
    use(h.entries());
  }
  function w() {
    a = [1];
    b = [1];
    d = new Set();
    e = new Map();
    h = new Set();
  }
}
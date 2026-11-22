import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// wrapped outer-member forms of a subsumed hop VALUE read: the subsumption identity check peels
// the transparent wrapper the oxc parser keeps (babel folds bare parens), and the outer key is
// read with SE folding, matching the inner meta's own key resolution - so each form injects only
// its member's modules, never the wide es.reflect.namespace. distinct method per line so each
// cell's import set is attributable
let e = 0;
globalThis.Reflect.ownKeys(obj1);
globalThis.Reflect[e++, 'getPrototypeOf'](obj2);
globalThis.Reflect?.has(obj3, 'k');
// template single-quasi and nested-sequence tails fold like the plain string form
globalThis.Reflect[`apply`](f, obj5, []);
globalThis.Reflect[e++, e++, 'construct'](C, []);
// a paren-wrapped WRITE host is still a write: no subsumption, the mutated-static constructor
// injection is kept
globalThis.WeakSet.customExt = 1;
// a paren-wrapped `.prototype` chain carries no own-static receiver guarantee - the hop value
// meta keeps firing
globalThis.Map.prototype.has.call(m, 1);
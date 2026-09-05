import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `Map = 1` in module / strict mode resolves the LHS binding before the assignment runs;
// when Map isn't declared (engine lacks native), the resolution throws ReferenceError
// before the write completes. global mode injects the polyfill so the resolution finds
// the constructor. semantics after the assignment are nonsense (Map becomes a number)
// but the load-time polyfill is what prevents the pre-write ReferenceError
Map = 1;
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// nested optional chains with `.includes(...)`: each chain has its own guard, but the
// instance-method rewrite still fires symmetrically inside both.
a?.b?.includes(1);
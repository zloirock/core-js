import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// SequenceExpression as static-callee receiver: `(fn(), Array).from(x)`. the comma-prefix
// is observable - usage-global emission must preserve the side-effect before the polyfill
// imports so eval order matches user intent. only the tail `Array` participates in the
// substitution lookup; the prefix call remains in the emitted source verbatim.
(side(), Array).from([1, 2]);
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$create from "@core-js/pure/actual/object/create";
// Object.create returns a NEW object whose [[Prototype]] is the argument, so its instance-method
// surface is indeterminate: an array-proto result inherits array methods (`.includes` is live and
// needs the polyfill on ie:11), a plain-object proto does not. it is intentionally left un-hinted so
// the result resolves to an indeterminate type and routes to the receiver-dispatching generic helper -
// which polyfills the inherited method AND stays guard-clean (no Array claim, so Array.isArray-based
// narrowing is not corrupted). the bare Object.create call is itself a polyfilled static.
const C = _Object$create([1, 2]);
_includes(C).call(C, 1);

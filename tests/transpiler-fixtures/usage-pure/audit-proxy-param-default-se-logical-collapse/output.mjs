import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
function effect() {}
function f({
  from,
  ...rest
} = (effect(), _self.Array || _Set)) {
  return from([1]);
}
f();
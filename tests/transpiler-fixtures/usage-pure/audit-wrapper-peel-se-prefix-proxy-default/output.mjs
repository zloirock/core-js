import _self from "@core-js/pure/actual/self";
// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
function f({
  from,
  ...rest
} = (effect(), _self.Array)) {
  return from([1]);
}
f();
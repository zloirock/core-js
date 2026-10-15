import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
// Only live written values contribute receiver families through a prototype path.
// A served global presence probe rules out its string write.
// A shadowed probe keeps its string alternative, observed by a distinct instance method.
let effects = 0;
let realm = _globalThis;
const rebind = () => {
  realm = {};
  if (typeof _Map === 'undefined') realm = {
    Array: {
      prototype: 'ab'
    }
  };
};
const at = _atMaybeArray((effects++, realm.Array.prototype));
export function read(Map) {
  let source = _globalThis;
  function write() {
    source = {};
    if (typeof Map === 'undefined') source = {
      Array: {
        prototype: 'ab'
      }
    };
  }
  write();
  const includes = _includes(source.Array.prototype);
  return includes;
}
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Only live written values contribute receiver families through a prototype path.
// A served global presence probe rules out its string write.
// A shadowed probe keeps its string alternative, observed by a distinct instance method.
let effects = 0;
let realm = globalThis;
const rebind = () => {
  realm = {};
  if (typeof Map === 'undefined') realm = {
    Array: {
      prototype: 'ab'
    }
  };
};
const {
  Array: {
    prototype: {
      at
    }
  }
} = (effects++, realm);
export function read(Map) {
  let source = globalThis;
  function write() {
    source = {};
    if (typeof Map === 'undefined') source = {
      Array: {
        prototype: 'ab'
      }
    };
  }
  write();
  const {
    Array: {
      prototype: {
        includes
      }
    }
  } = source;
  return includes;
}
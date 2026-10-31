import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A written alternative can make the nested prototype a string receiver.
// Both array and string at remain possible even when the writing function is invoked.
// An intermediate default can also supply a string after a missing constructor slot.
let effects = 0;
let realm = globalThis;
const rebind = () => {
  realm = {
    Array: {
      prototype: 'ab'
    }
  };
};
rebind();
const {
  Array: {
    prototype: {
      at
    }
  }
} = (effects++, realm);
let defaultedRealm = globalThis;
const clear = () => {
  defaultedRealm = {};
};
clear();
const {
  Array: {
    prototype: {
      includes
    }
  } = {
    prototype: 'ab'
  }
} = defaultedRealm;
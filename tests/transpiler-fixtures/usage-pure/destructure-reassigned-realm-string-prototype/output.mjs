import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A written alternative can make the nested prototype a string receiver.
// Both array and string at remain possible even when the writing function is invoked.
// An intermediate default can also supply a string after a missing constructor slot.
let effects = 0;
let realm = _globalThis;
const rebind = () => {
  realm = {
    Array: {
      prototype: 'ab'
    }
  };
};
rebind();
const at = _at((effects++, realm.Array.prototype));
let defaultedRealm = _globalThis;
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
    prototype: {
      includes: _includesMaybeString('ab')
    }
  }
} = defaultedRealm;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// A defaulted instance leaf beside a static keeps its dispatch and live fallback.
// Receiver effects run once before either binding; anonymous defaults keep their inferred names.
let eff = 0;
const {
  Array: {
    prototype: {
      flat: f1 = () => 1
    },
    of: o1
  }
} = (eff++, {
  Array: {
    prototype: {
      flat: _flatMaybeArray(_globalThis.Array.prototype)
    },
    of: _Array$of
  }
});
eff++;
const f2 = (_ref = _flatMaybeArray(_globalThis.Array.prototype)) === void 0 ? {
  "f2": () => 1
}["f2"] : _ref;
const a2 = _atMaybeArray(_globalThis.Array.prototype);
const {
  Array: {
    prototype: {
      flat: f3 = () => 1
    },
    of: o3
  }
} = (eff++, {
  Array: {
    prototype: {
      flat: _flatMaybeArray(_self.Array.prototype)
    },
    of: _Array$of
  }
});
const {
  Array: {
    prototype: {
      flat: f4 = () => 1,
      at: a4 = () => 2
    },
    of: o4
  }
} = (eff++, {
  Array: {
    prototype: {
      flat: _flatMaybeArray(_globalThis.Array.prototype),
      at: _atMaybeArray(_globalThis.Array.prototype)
    },
    of: _Array$of
  }
});
let f5, o5;
({
  Array: {
    prototype: {
      flat: f5 = () => 1
    },
    of: o5
  }
} = (eff++, {
  Array: {
    prototype: {
      flat: _flatMaybeArray(_globalThis.Array.prototype)
    },
    of: _Array$of
  }
}));
// ... and off a USER receiver of unknown type, where the default is live and its name observable
function pick(user) {
  var _ref2;
  const _ref3 = (eff++, user);
  const m6 = (_ref2 = _findIndexMaybeArray(_ref3.codes)) === void 0 ? {
    "m6": () => 1
  }["m6"] : _ref2;
  const {
    other: o6
  } = _ref3;
  return [m6, o6];
}
export { eff, f1, o1, f2, a2, f3, o3, f4, a4, o4, f5, o5, pick };
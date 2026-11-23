import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Promise from "@core-js/pure/actual/promise";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _structuredClone from "@core-js/pure/actual/structured-clone";
var _ref8, _ref9;
// The exported constructor includes its static methods for external consumers.
export const viaBareProbePoly = (_globalThis.window.Promise, _Promise);
export const {
  customThing: viaBareProbeCustom
} = _globalThis.window;
const _ref = _globalThis.window,
  {
    Array: {}
  } = _ref,
  viaBareProbeRestPoly = _Array$of,
  viaBareProbeRest = (_ref2 => {
    const _ref7 = {};
    const _ref4 = _Reflect$ownKeys(typeof _ref2 === "object" || typeof _ref2 === "function" ? _ref2 : {
      ..._ref2
    });
    for (let _ref3 = 0; _ref3 < _ref4.length; _ref3 += 1) {
      const _ref5 = _ref4[_ref3];
      const _ref6 = _ref5 !== "Array" && _Object$getOwnPropertyDescriptor(_ref2, _ref5);
      if (_ref6 && _ref6.enumerable) _Object$defineProperty(_ref7, _ref5, {
        __proto__: null,
        value: _ref2[_ref5],
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    return _ref7;
  })(_ref);
export { viaBareProbeRestPoly, viaBareProbeRest }; // The bare window read and its sealed twin consume the source once, as does an alias holding
// that value. Resolving a root or a deep self-reference still allows the realm to collapse.
export const {
  Array: {
    of: viaBareProbe
  }
} = ({} = _globalThis.window, {
  Array: {
    of: _Array$of
  }
});
export const {
  Array: {
    of: viaBareProbeSealed
  }
} = ({} = _globalThis.window, {
  Array: {
    of: _Array$of
  }
});
export const viaBareProbeFlat = (_globalThis.window.structuredClone, _structuredClone);
export const {
  Array: {
    of: viaBareProbeTernary
  }
} = _globalThis.setTimeout ? null == (_ref8 = _globalThis.window) ? _ref8 : {
  Array: {
    of: _Array$of
  }
} : null == (_ref9 = _globalThis.window) ? _ref9 : {
  Array: {
    of: _Array$of
  }
};
const heldProbe = _globalThis.window;
export const {
  Array: {
    of: viaBareProbeAlias
  }
} = ({} = heldProbe, {
  Array: {
    of: _Array$of
  }
});
export const {
  Array: {
    of: viaDefinedGlobal
  }
} = {
  Array: {
    of: _Array$of
  }
};
export const {
  Array: {
    of: viaDefinedSelf
  }
} = {
  Array: {
    of: _Array$of
  }
};
export const {
  Array: {
    of: viaDeepSelfRef
  }
} = {
  Array: {
    of: _Array$of
  }
};
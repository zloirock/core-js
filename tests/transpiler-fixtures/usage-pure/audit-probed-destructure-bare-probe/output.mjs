import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _structuredClone from "@core-js/pure/actual/structured-clone";
// The exported constructor includes its static methods for external consumers.
export const viaBareProbePoly = (_globalThis.window.Promise, _Promise);
export const {
  customThing: viaBareProbeCustom
} = _globalThis.window;
export const viaBareProbeRestPoly = _Array$of;
const {
  Array: _unused,
  ...viaBareProbeRest
} = _globalThis.window;
export { viaBareProbeRest }; // The bare window read and its sealed twin consume the source once, as does an alias holding
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
} = _globalThis.setTimeout ? null == _globalThis.window ? _globalThis.window : {
  Array: {
    of: _Array$of
  }
} : null == _globalThis.window ? _globalThis.window : {
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
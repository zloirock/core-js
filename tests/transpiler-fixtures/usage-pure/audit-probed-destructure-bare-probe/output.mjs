import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _structuredClone from "@core-js/pure/actual/structured-clone";
// The exported constructor includes its static methods for external consumers.
export const viaBareProbePoly = ((null == _globalThis.window ? void 0 : _globalThis.window).Promise, _Promise);
export const {
  customThing: viaBareProbeCustom
} = _globalThis.window;
export const viaBareProbeRestPoly = _Array$of;
export const {
  Array: _unused,
  ...viaBareProbeRest
} = _globalThis.window;

// the value that IS the environment probe: a bare one-hop init (`= globalThis.window`), its
// sealed twin, an agreeing-proxy ternary collapse and an alias HOLDING the probe all consume
// a value that is absent exactly off-env - the probe reads the first key off the guard whose
// test operand doubles as the alternate. resolvable roots keep their collapse, and the deep
// unresolvable hop keeps the accepted realm-self-reference collapse
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
export const viaBareProbeFlat = ((null == _globalThis.window ? void 0 : _globalThis.window).structuredClone, _structuredClone);
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
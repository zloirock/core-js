import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// param-default / IIFE-arg / inner-default synth-swaps over an UNDEFINABLE receiver keep the
// plain always-defined literal: the caller-correct fallback slot fires only when nothing was
// passed, and the ponyfill resolves where native would throw on the absent host - the accepted
// divergence the provider AGENTS.md spells. the one exception rides the SEAL rule, not this
// one: a sealed receiver read in the flat synth-swap re-emits as a throw probe (the source
// itself spells the read the swap would erase), while the nested mirror stays plain on every
// spelling

// flat synth-swap, plain optional nav receiver
export function viaParamFlat({
  of
} = {
  of: _Array$of
}) {
  return of;
}

// flat synth-swap, SEALED receiver read: the probe survives in the fallback slot
export function viaParamSealed({
  of
} = ((null == _globalThis.window ? void 0 : _self).Array, {
  of: _Array$of
})) {
  return of;
}

// flat synth-swap, alias-held receiver
const heldCtor = _globalThis.window?.Array;
export function viaParamAlias({
  of
} = {
  of: _Array$of
}) {
  return of;
}

// flat synth-swap, IIFE argument position
export const viaIifeArg = (({
  of
}) => of)({
  of: _Array$of
});

// flat synth-swap, inner destructure default
export const {
  propA: {
    of: viaInnerDefault
  } = {
    of: _Array$of
  }
} = {};

// flat synth-swap, sequence-prefixed receiver (the prefix stays around the swap)
let e1 = 0;
export function viaParamSeq({
  of
} = (e1++, {
  of: _Array$of
})) {
  return [of, e1];
}

// flat synth-swap, unresolved sibling key still reads the receiver
export function viaParamMixed({
  of,
  customZ
} = {
  of: _Array$of,
  customZ: (_globalThis.window?.Array).customZ
}) {
  return [of, customZ];
}

// nested mirror, plain optional deep nav receiver
export function viaMirrorNested({
  Array: {
    of
  }
} = {
  Array: {
    of: _Array$of
  }
}) {
  return of;
}

// nested mirror, sealed receiver
export function viaMirrorSealed({
  Array: {
    of
  }
} = {
  Array: {
    of: _Array$of
  }
}) {
  return of;
}

// nested mirror, passthrough sibling beside the polyfilled leaf
export function viaMirrorPassthrough({
  Math: {
    floor
  },
  Array: {
    of
  }
} = {
  Math: {
    floor: _self.Math.floor
  },
  Array: {
    of: _Array$of
  }
}) {
  return [floor, of];
}

// nested mirror in a runtime ternary
let cond1 = false;
export function viaMirrorTernary({
  Array: {
    of
  }
} = cond1 ? {
  Array: {
    of: _Array$of
  }
} : {
  Array: {
    of: () => 1
  }
}) {
  return of;
}

// defined receivers render the same way
export function viaDefinedSelf({
  of
} = {
  of: _Array$of
}) {
  return of;
}
export function viaDefinedMirror({
  Array: {
    of
  }
} = {
  Array: {
    of: _Array$of
  }
}) {
  return of;
}
export function viaLogicalRescue({
  of
} = _globalThis.window?.Array ?? {}) {
  return of;
}
import _globalThis from "@core-js/pure/actual/global-this";
// a param-default synth twin without a SE key: the wrapper default stays the synth target
export const fromSynthDefault = (({
  from
} = _globalThis.window ?? {
  from: x => [x]
}) => from)([1]);
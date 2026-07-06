import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a call-rooted fallback LEFT with an SE-bearing computed hop key: the discarded left's effects
// re-emit in SOURCE order ahead of the synth literal - the chain-root call evaluates BEFORE the
// hop key (object before key), interleaved via the rescue channel, not appended last
function f({
  from
} = ((() => (n++, _globalThis))(), eff(), {
  from: _Array$from
})) {
  return from;
}
function g({
  of
} = (eff2(), {
  of: _Array$of
})) {
  return of;
}
export const r = [f(), g()];
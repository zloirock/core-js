import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
// An IIFE destructure param with a DEFAULT, invoked with a proxy-global MEMBER-EXPRESSION call-arg. The
// param-default is a polyfill dead-end for the destructured key(s) (`Object.from` / `Object.of` /
// `Object.allSettled` do not exist), so the live safe-access arg supersedes it and its static polyfill is
// synth-swapped in. Cases: a direct member, a deeper proxy hop (`globalThis.self.Array`), and a multi-key
// pattern. A default that itself carries a polyfill would instead stay the synth target (the live fallback
// for an undefined call-arg).
const a = (({
  from
} = Object) => from([1]))({
  from: _Array$from
});
const b = (({
  of
} = Object) => of(1, 2))({
  of: _Array$of
});
const c = (({
  allSettled,
  any
} = Object) => allSettled([]))({
  allSettled: _Promise$allSettled,
  any: _Promise$any
});
export { a, b, c };
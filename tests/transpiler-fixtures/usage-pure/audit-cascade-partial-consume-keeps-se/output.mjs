import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let effectRan = false,
  rest;
let from;
({
  Array: {
    from
  },
  ...rest
} = (effectRan = true, _self));
let counted = 0,
  keep;
let of;
({
  keep
} = (counted++, _self));
of = _Array$of;
export const r = [from, of, rest, keep, effectRan, counted];
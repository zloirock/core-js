import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// nested destructure mixing a STATIC key (`from` on Array) and an INSTANCE key (`flat` on
// `arr`) in sibling branches, each with its own effecting prefix. both polyfill via the
// residual; keys stay in place renamed so both effects run in source order. a bare-Identifier
// or literal receiver is safe to re-reference; a getter MemberExpression or call bails native.
const arr = [1, [2]];
const f = _Array$from;
const m = _flatMaybeArray(arr);
const {
  x: {
    [(before(), 'from')]: _unused
  },
  y: {
    [(after(), 'flat')]: _unused2
  }
} = {
  x: Array,
  y: arr
};
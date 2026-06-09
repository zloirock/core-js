import _Array$from from "@core-js/pure/actual/array/from";
const f = _Array$from;
// a side-effecting computed key with a `...rest` sibling. the residual keeps the key in place (renamed
// to a throwaway, so `rest` excludes it and the effect runs EXACTLY ONCE) and extracts the polyfill to a
// separate `const f = _Array$from`. the effect runs in the kept key
const {
  [(effectful(), 'from')]: _unused,
  ...rest
} = Array;
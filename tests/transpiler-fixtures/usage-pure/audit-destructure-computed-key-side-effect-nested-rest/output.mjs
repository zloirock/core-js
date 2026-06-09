import _Array$from from "@core-js/pure/actual/array/from";
const f = _Array$from;
// a NESTED side-effecting computed key with a `...rest` sibling - same once-only + rest-exclusion
// guarantee one level down. the residual keeps the key in place (renamed to a throwaway, so `rest` still
// excludes it and the effect runs once) and extracts the polyfill separately. regression: an earlier
// lift double-ran the effect (babel) / dropped the rest key (unplugin)
const {
  x: {
    [(effectful(), 'from')]: _unused,
    ...rest
  }
} = {
  x: Array
};
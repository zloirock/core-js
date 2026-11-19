import _Array$from from "@core-js/pure/actual/array/from";
// Global also needs Array.from for loop syntax; the separate of twin observes this claim.
// An effectful computed static key runs once in the for-of head.
for (const {
  [(eff(), 'from')]: viaSeKey
} of [{
  from: _Array$from
}]) viaSeKey([]);
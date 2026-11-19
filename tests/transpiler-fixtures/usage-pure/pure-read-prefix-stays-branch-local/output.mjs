import _Array$from from "@core-js/pure/actual/array/from";
// An undecided selection keeps the prefixed Array receiver branch-local. The pure-read prefix may be
// discarded only with its selected receiver; either arm still supplies the Array.from polyfill.
export function read(flag) {
  const {
    from
  } = flag ? {
    from: _Array$from
  } : {
    from: _Array$from
  };
  return from;
}
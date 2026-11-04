import _Array$from from "@core-js/pure/actual/array/from";
// A fallback arm cannot supply the method of a selected user object.
// The key still runs once before the method is read.
export function read(input) {
  const {
    slot: {
      [(effect(), 'from')]: from
    }
  } = {
    slot: input || {
      "from": _Array$from
    }
  };
  return from([3]);
}
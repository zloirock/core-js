import _Array$from from "@core-js/pure/actual/array/from";
// Mirroring a constructor does not serve its disabled static sibling.
export function read({
  from,
  // core-js-disable-next-line
  of
} = (Array, {
  from: _Array$from,
  // core-js-disable-next-line
  get of() {
    // core-js-disable-next-line
    return Array.of;
  }
})) {
  return [from, of];
}
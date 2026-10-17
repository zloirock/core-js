import _Set from "@core-js/pure/actual/set";
// a getter winning the key is a dynamic value -> bail (native)
export function accessorBails() {
  const ns = {
    get R() {
      return _Set;
    }
  };
  const {
    R: {
      union
    }
  } = ns;
  return union;
}
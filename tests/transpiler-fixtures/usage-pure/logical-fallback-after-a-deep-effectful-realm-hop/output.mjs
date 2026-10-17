import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A backed realm constructor makes the logical fallback inert.
// Its computed key still runs once before the static binding is read.
let count = 0;
count++;
const getOwnPropertyNames = _Object$getOwnPropertyNames;
export const result = getOwnPropertyNames({
  z: 1
});
export { count };
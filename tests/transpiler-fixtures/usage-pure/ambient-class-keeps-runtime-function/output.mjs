// The erased class declaration and the runtime function share the value binding.
declare class Map {}
function Map() {
  return "user";
}
export const result = Map();
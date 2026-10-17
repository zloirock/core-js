import "core-js/modules/es.array.at";
// Either constructor arm supplies the Array prototype; the test still runs once.
export function read(pick) {
  const {
    prototype: {
      at
    }
  } = pick() ? Array : Array;
  return at.call([4], 0);
}
export const result = [read(() => true), read(() => false)];
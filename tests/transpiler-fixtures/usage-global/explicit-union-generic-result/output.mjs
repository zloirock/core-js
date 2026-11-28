import "core-js/modules/es.string.at";
function second<T>(x: T, y: T): T {
  return y;
}
export const result = second<string | number[]>([7], "abc").at(0);
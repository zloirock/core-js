import "core-js/modules/es.array.at";
// Either nested array can reach this check, including the readonly one.
type Batches = Array<string[]> | Array<readonly string[]>;
type Content = Batches extends Array<string[]> ? string : number[];
function read(value: Content) {
  return value.at(0);
}
export const result = read([42]);
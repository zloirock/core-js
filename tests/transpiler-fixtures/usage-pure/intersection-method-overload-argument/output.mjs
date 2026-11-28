import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
function convert(x: string): string;
function convert(x: number): number[];
function convert(x: string | number) {
  return typeof x === 'number' ? [x] : x;
}
type Converter = {
  convert(x: string): string;
} & {
  convert(x: number): number[];
};
const c: Converter = {
  convert
};
const proof: number[] = c.convert(8);
export const result = [_atMaybeArray(_ref = c.convert(8)).call(_ref, 0), proof[0]];
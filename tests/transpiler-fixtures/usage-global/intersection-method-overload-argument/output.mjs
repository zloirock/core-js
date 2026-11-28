import "core-js/modules/es.array.at";
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
export const result = [c.convert(8).at(0), proof[0]];
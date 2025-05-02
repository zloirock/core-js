import 'core-js/full';

function sumTo(this: { base: number }, a: number, b: number): number {
  return this.base + a + b;
}
const sumToD = sumTo.demethodize();
const rsumd: number = sumToD({ base: 1 }, 2, 3);
// @ts-expect-error
sumToD(2, 3);

const sliceD: (thisArg: string, start: number, end?: number) => string = String.prototype.slice.demethodize();
const rs = sliceD('foobar', 1, 3);
// @ts-expect-error
sliceD();

import demethodize from '@core-js/pure/full/function/demethodize';

function sumTo(this: { base: number }, a: number, b: number): number {
  return this.base + a + b;
}

demethodize(sumTo);

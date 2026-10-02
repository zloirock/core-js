import "core-js/modules/es.array.at";
// An all-nullish union retains undefined as a possible default trigger.
const box: {
  fn?: (value?: number[] | null) => number[] | null;
} = {};
box.fn = (value: number[] | null = [8, 9]) => value;
const arg: null | undefined = undefined;
use(box.fn(arg)?.at(-1));
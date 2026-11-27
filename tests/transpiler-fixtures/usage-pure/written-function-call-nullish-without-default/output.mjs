// Omitting the default leaves the passed undefined value untouched.
const box: {
  fn?: (value?: number[] | string | null) => number[] | string | null | undefined;
} = {};
box.fn = (value?: number[] | string | null) => value;
const arg: null | undefined = undefined;
export const result = box.fn(arg)?.at(-1);
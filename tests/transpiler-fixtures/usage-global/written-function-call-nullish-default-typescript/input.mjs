// An all-nullish union retains undefined as a possible default trigger.
const box: { fn?: (value?: number[] | string | null) => number[] | string | null } = {};
box.fn = (value: number[] | string | null = [8, 9]) => value;
const arg: null | undefined = undefined;
use(box.fn(arg)?.at(-1));

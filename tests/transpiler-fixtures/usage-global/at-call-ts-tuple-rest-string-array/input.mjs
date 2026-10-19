declare const tuple: [number, ...string[]];
// @ts-expect-error the member read is the probe, and the right answer is a type without it
tuple.at(-1).trim();

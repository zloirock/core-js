import "core-js/modules/es.error.cause";
// @ts-expect-error the member read is the probe, and the right answer is a type without it
(x as Error).at(-1);
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// @ts-expect-error the member read is the probe, and the right answer is a type without it
(x as keyof number[]).at(-1);
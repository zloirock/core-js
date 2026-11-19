import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
declare const a: NonNullable<string | null>;
a.at(0);
declare const b: NonNullable<null>;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
b.toFixed(2);
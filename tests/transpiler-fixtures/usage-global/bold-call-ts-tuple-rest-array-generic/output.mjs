import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.bold";
declare const tuple: [number, ...Array<string>];
// @ts-expect-error the member read is the probe, and the right answer is a type without it
tuple.at(0).toFixed(2);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
tuple.at(1).bold();
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// A named realm property can hold a constructor returning any instance family.
new globalThis.ExternalList().at(-1);
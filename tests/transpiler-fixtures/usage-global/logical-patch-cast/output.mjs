import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
// A type assertion wraps the write target, not its receiver.
// Global mode retains the write and the original fallback.
(Array.prototype.flatMap as any) ??= () => ['fallback'];
export {};
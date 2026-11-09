import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// A cloned constructor keeps its parameter property and the transformed default.
export const last = new class {
  constructor(public readonly value: number[] = Array.from([1, 2])) {}
}().value.at(-1);
import "core-js/modules/es.array.at";
// An indirect entry keeps its effects and all typed parameter forms through the scoped walk.
// @ts-expect-error The comma callee intentionally keeps a discarded value.

type Consumer = (...values: number[]) => void;
interface Box {
  read([a]: number[]): void;
}
export class Value {
  constructor(public value = 1) {}
}
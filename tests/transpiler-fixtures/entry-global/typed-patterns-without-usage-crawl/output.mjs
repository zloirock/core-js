import "core-js/modules/es.array.at";
// Expanding an entry preserves type signatures and constructor parameter properties.
// Their patterns need no scope-crawler preparation in entry mode.

declare function consume(...values: number[]): void;
type Consumer = (...values: number[]) => void;
export class Box {
  constructor(public value: number = [1].at(0)!) {}
  run(consumeValue: Consumer) {
    consumeValue(this.value);
  }
}
consume(new Box().value);
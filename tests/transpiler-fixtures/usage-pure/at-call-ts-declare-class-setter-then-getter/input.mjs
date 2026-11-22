declare class Store {
  set value(value: number[]);
  get value(): string;
}
declare const s: Store;
// Reads use the getter type even when the setter is declared first.
s.value.at(0);

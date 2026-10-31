declare class Box<T> {
  get data(): T[];
  get rawKeys(): string[];
  plain: T[];
}
declare const b: Box<number>;
// getter access yields the getter's return type - the three polyfill targets exercise
// the generic body (`T[]` with T=number), a concrete annotation (`string[]`), and a plain
// class property for comparison. all three should resolve to an Array receiver and pick
// the Array variant of `.at`; without getter return-type extraction the getter reads
// would resolve to `Function` and skip polyfilling entirely
b.data.at(0);
b.rawKeys.at(-1);
b.plain.at(1);

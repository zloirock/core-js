// keyof-source mapped expansion must skip symbol-keyed members per TS spec instead of
// bailing the entire enumeration; sibling string-keyed members still narrow
interface I {
  [Symbol.iterator]: () => Iterator<number>;
  items: number[];
}
type Mapped = { [K in keyof I]: I[K] };
declare const m: Mapped;
m.items.at(0);
m.items.includes(1);

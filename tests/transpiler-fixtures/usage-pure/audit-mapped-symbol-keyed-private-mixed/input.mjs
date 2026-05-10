// keyof-source mapped expansion with mix of computed (Symbol-keyed), private, and string
// keys; all non-string-keyed members must skip continue while string-keyed survive
class Mixed {
  ['#priv'] = 1;
  [Symbol.iterator] = () => null;
  declare items: number[];
  declare flags: boolean[];
}
type Mapped = { [K in keyof Mixed]: Mixed[K] };
declare const m: Mapped;
m.items.at(0);
m.flags.includes(true);

// bigint enum members (`100n` / `1n`) are classified like numeric / string ones. here the
// receiver is `String(v)`, so `tag` is a plain string regardless of the enum's value kind, and
// the chained calls dispatch string-specific helpers. distinct methods make the resolution observable.
enum Bag {
  // @ts-expect-error an enum member tsc refuses is the shape under test
  Big = 100n,
  // @ts-expect-error an enum member tsc refuses is the shape under test
  Small = 1n,
}
declare const v: Bag;
const tag = String(v);
tag.at(0);
tag.includes('1');

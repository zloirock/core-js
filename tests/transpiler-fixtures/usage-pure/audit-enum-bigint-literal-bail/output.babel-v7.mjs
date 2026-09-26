import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// bigint enum members (`100n` / `1n`) are classified like numeric / string ones. here the
// receiver is `String(v)`, so `tag` is a plain string regardless of the enum's value kind, and
// the chained calls dispatch string-specific helpers. distinct methods make the resolution observable.
enum Bag {
  Big = 100n,
  Small = 1n,
}
declare const v: Bag;
const tag = String(v);
_atMaybeString(tag).call(tag, 0);
_includesMaybeString(tag).call(tag, '1');
// a slot the file WROTE before a pattern read it holds the literal's value or a written one: pure
// guards the read on each candidate the slot may hold, usage-global injects for each - the container
// bound to a literal, the one bound to a named call, and a write under a key the file cannot name,
// which reaches every slot. the Map write owes its constructor entry. a write the read runs ahead of
// never lands under it: that read holds the literal's value alone
const holder = { a: Object };
holder.a = Map;
const { a: viaLiteralHolder } = holder;
export const fromLiteralHolder = viaLiteralHolder.groupBy([1, 2], v => v % 2);
const build = () => ({ b: Math });
const yielded = build();
yielded.b = Array;
const { b: viaCallHolder } = yielded;
export const fromCallHolder = viaCallHolder.of(1);
const keyed = { c: Object };
keyed[key] = String;
const { c: viaUnknownKey } = keyed;
export const fromUnknownKey = viaUnknownKey.raw`x`;
const late = { d: Object };
const { d: viaLateWrite } = late;
late.d = Promise;
export const fromLateWrite = viaLateWrite.withResolvers();

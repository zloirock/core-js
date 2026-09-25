// A pattern level whose value is a selection or a call pairs every arm and what the call canon pairs
// the call with - a factory's literal, every literal disagreeing returns spell - at the head and at
// every nested level, so a static read off the binding is served for each constructor it may hold
const flag = globalThis.flag;
const make = () => ({ a: Array });
function pick() { if (flag) return { a: Object }; return { a: Math }; }
const { a: HeadSelected } = flag ? { a: Array } : { a: Math };
const { k: { a: NestedSelected } } = { k: flag ? { a: Number } : { a: Math } };
const { k: { a: NestedCall } } = { k: make() };
const { k: { a: NestedReturns } } = { k: pick() };
export const r = [
  HeadSelected.from([1]),
  NestedSelected.isInteger(1),
  NestedCall.of(1),
  NestedReturns.fromEntries([]),
];

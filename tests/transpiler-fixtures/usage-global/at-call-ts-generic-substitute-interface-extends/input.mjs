interface StringList extends Array<string> {}
function toList<T>(x: T): StringList { return [String(x)] as StringList; }
// @ts-expect-error the member read is the probe, and the right answer is a type without it
toList(42).at(-1).toFixed(2);

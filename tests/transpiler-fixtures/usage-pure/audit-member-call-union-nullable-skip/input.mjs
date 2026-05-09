// member-call dispatch on `Foo | null` — null branch has no method, but should NOT bail
// the whole union. dispatch narrows to Foo's method polyfill
declare const x: string[] | null;
x!.at(0);

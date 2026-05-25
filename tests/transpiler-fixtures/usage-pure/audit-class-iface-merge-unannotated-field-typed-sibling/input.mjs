// declaration-merging: a class field without type annotation should NOT halt member
// lookup before the sibling interface declaration supplies the type. `findTypeMember`
// must `break` past the unannotated PropertyDefinition / TSPropertySignature and let
// the typed sibling resolve `c.items` to `number[]` -> only `es.array.at` polyfill,
// not the generic Maybe-array variant.
class C {
  items = [];
}
interface C {
  items: number[];
}
declare const c: C;
c.items.at(-1);
[c];

// getter `get list(): number[]` vs method `next(): number[]` - same `number[]` return type,
// but getter-access reads the value directly (property semantics) while method-access returns
// a function reference. findTypeMember + resolveMemberAnnotation branch on `kind === 'get'`
// so `i.list` yields number[] (narrow to array polyfill), while plain method stays function
interface Iter {
  get list(): number[];
  next(): number[];
}
declare const i: Iter;
i.list.at(-1);
i.next().at(-1);

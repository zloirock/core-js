// property-access path symmetric to method-call path: `class C<V> { val: V }` with
// `const x: C<string[]>` substitutes V -> string[] for the property type, so x.val
// is Array-typed and .includes() picks the array-specific polyfill
class C<V> {
  val: V = undefined as any;
}
declare const x: C<string[]>;
x.val.includes('a');

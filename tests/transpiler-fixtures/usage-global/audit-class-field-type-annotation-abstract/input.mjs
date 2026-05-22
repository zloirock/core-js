// abstract class fields carry the same typeAnnotation slot as concrete ones, but their
// declaration has no runtime body / initializer. visitor must still walk the annotation
// so Map / Set polyfills are emitted - the declared type signals the subclass will need
// the bound globals at runtime even though the abstract member itself never executes
abstract class C<T> {
  abstract bag: Map<string, T>;
  abstract accessor cache: Set<T>;
}
new (class extends C<number> {
  bag = new Map();
  cache = new Set();
})();

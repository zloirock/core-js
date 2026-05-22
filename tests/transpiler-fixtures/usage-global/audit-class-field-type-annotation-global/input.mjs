// class-field type annotations (`x: Map<T>`, `accessor y: Set<T>`) carry the typeAnnotation
// on the field-level AST node, NOT on a nested function expression. visitor entries for
// PropertyDefinition / AccessorProperty must walk the field typeAnnotation directly -
// without that walk, the Map / Set polyfills are missed even though the same annotation
// on a function parameter would emit them. abstract variants tracked the same way since
// their declared types still signal runtime usage of the bound globals
class Container<T> {
  bag: Map<string, T>;
  accessor cache: Set<T>;
  constructor() {
    this.bag = new Map();
    this.cache = new Set();
  }
}
new Container<number>();

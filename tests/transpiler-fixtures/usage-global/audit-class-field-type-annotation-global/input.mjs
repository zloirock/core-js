// class-field type annotations (`x: Map<T>`, `accessor y: Set<T>`) carry the typeAnnotation
// on the field-level AST node (PropertyDefinition / AccessorProperty), NOT on a nested
// function expression, so the field annotation must be walked directly - otherwise the
// Map / Set polyfills are missed. abstract fields track the same way (their types still signal usage).
class Container<T> {
  bag: Map<string, T>;
  accessor cache: Set<T>;
  constructor() {
    this.bag = new Map();
    this.cache = new Set();
  }
}
new Container<number>();

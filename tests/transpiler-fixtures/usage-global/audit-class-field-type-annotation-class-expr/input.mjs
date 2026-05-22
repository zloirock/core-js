// class EXPRESSION (not declaration) carries the same body / PropertyDefinition shape.
// visitor entries must hit the field typeAnnotation on ClassExpression too, otherwise the
// Map polyfill is dropped when the class is bound to a const instead of a class statement
const C = class {
  bag: Map<string, number> = new Map();
};
new C();

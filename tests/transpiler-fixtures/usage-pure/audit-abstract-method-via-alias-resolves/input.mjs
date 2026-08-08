// an abstract method reached through a type ALIAS (or intersection / union) resolves via the annotation-fold
// path, where oxc models `abstract m()` as TSAbstractMethodDefinition (same `.value` wrap as a concrete
// MethodDefinition). its return type must drive the polyfill (array `.at`), not fall through to generic
abstract class Shape { abstract vertices(): number[]; }
type ShapeAlias = Shape;
declare const s: ShapeAlias;
export const r = s.vertices().at(0);

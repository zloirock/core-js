// Same class node uses `extends Promise<string>` (runtime superClass slot) AND
// `implements Bar<Set<number>>` (pure-erase implements heritage). Promise MUST get its
// polyfill (extends is a runtime construct - class A inherits Promise's behavior at
// instantiation), while Set MUST NOT (implements is a pure type contract, the user did
// not signal Set will be invoked at runtime). pins the asymmetry: same TSExpression
// WithTypeArguments AST shape, distinguished only by parent's listKey (superClass vs
// implements) in babel; oxc keeps a dedicated TSClassImplements wrapper
interface Bar<T> { y: T }
class C extends Promise<string> implements Bar<Set<number>> {
  constructor(exec) { super(exec); }
}

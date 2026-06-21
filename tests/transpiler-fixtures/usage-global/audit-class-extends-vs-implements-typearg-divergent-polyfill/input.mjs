// Same class uses `extends Promise<string>` (runtime superClass slot) AND
// `implements Bar<Set<number>>` (pure-erase heritage). Promise MUST get its polyfill
// (extends inherits its behavior at instantiation); Set MUST NOT (implements is a pure
// type contract). same AST shape, distinguished only by superClass vs implements position.
interface Bar<T> { y: T }
class C extends Promise<string> implements Bar<Set<number>> {
  constructor(exec) { super(exec); }
}

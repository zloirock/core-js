// Capturing a conditional result directly or through a function return stays type-only.
// Neither ambient declaration supplies a runtime read for pure mode to replace.
declare const direct: Set<number> extends infer Captured ? Captured : never;
declare const returned: (() => WeakSet<object>) extends (() => infer Captured) ? Captured : never;
export { direct, returned };
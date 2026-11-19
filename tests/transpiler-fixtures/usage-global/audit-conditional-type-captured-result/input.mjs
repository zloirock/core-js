// The check type supplies a captured result, so its Set annotation still carries
// a usage-global obligation. Capturing through a function return has the same effect.
declare const direct: Set<number> extends infer Captured ? Captured : never;
declare const returned: (() => WeakSet<object>) extends (() => infer Captured) ? Captured : never;
export { direct, returned };

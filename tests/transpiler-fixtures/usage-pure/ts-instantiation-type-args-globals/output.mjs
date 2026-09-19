import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// type arguments are type-only but they name runtime globals, and folding the instantiation hands
// the whole list to the host above it - the sweep has to keep reaching them at their new owner.
// pure resolves those names to ponyfill bindings, so this twin also shows the type-only reference
// staying a TYPE: the annotation keeps the source name while the value position takes the import
declare const f: any;
const foldCall = (f as any)<Map<string, number>>([1]);
const foldNew = new (f as any)<Set<number>>();
const foldTag = (f as any)<WeakMap<object, number>>`t`;
const foldOptionalCall = (f as any)?.<Promise<number>>([1]);
const keptMemberTail = _nameMaybeFunction((f as any)<WeakSet<object>>);
const keptBareValue = (f as any)<ArrayBuffer>;
export const r = [foldCall, foldNew, foldTag, foldOptionalCall, keptMemberTail, keptBareValue];
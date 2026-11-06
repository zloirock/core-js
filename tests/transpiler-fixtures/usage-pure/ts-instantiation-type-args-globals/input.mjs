// type arguments are type-only but they name runtime globals, and folding the instantiation hands
// the whole list to the host above it - the sweep has to keep reaching them at their new owner.
// pure resolves those names to ponyfill bindings, so this twin also shows the type-only reference
// staying a TYPE: the annotation keeps the source name while the value position takes the import
declare const f: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const foldCall = ((f as any)<Map<string, number>>)([1]);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const foldNew = new ((f as any)<Set<number>>)();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const foldTag = ((f as any)<WeakMap<object, number>>)`t`;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const foldOptionalCall = ((f as any)<Promise<number>>)?.([1]);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const keptMemberTail = ((f as any)<WeakSet<object>>).name;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const keptBareValue = ((f as any)<ArrayBuffer>);
export const r = [foldCall, foldNew, foldTag, foldOptionalCall, keptMemberTail, keptBareValue];

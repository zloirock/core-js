// type arguments are type-only but they name runtime globals, and folding the instantiation hands
// the whole list to the host above it - the sweep has to keep reaching them at their new owner.
// one global per line: injection is observable only through the import set here, so two lines
// sharing a global would mask each other. the tail lines keep the instantiation node instead
declare const f: any;
const foldCall = ((f as any)<Map<string, number>>)([1]);
const foldNew = new ((f as any)<Set<number>>)();
const foldTag = ((f as any)<WeakMap<object, number>>)`t`;
const foldOptionalCall = ((f as any)<Promise<number>>)?.([1]);
const keptMemberTail = ((f as any)<WeakSet<object>>).name;
const keptBareValue = ((f as any)<ArrayBuffer>);
export const r = [foldCall, foldNew, foldTag, foldOptionalCall, keptMemberTail, keptBareValue];

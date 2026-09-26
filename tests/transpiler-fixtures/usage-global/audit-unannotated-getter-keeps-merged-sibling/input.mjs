// an UNANNOTATED accessor must not halt the member walk: declaration merging can supply the type
// from a sibling declaration, and stopping at the untyped accessor degrades to the generic family
class Holder { get items() { return []; } }
interface Holder { items: number[]; }
declare const holder: Holder;
export const first = holder.items.at(0);

interface Typed { get names(): number[]; }
declare const typed: Typed;
export const last = typed.names.findLast(x => x);

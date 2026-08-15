// one passthrough hop can cross SEVERAL wrappers: the `Awaited<>` walker peels through
// structure-preserving wrappers on its own, so reading only the outermost answers for neither
interface I {
  items: number[];
  tags?: number[];
}
declare const viaPartial: Awaited<Partial<I>>;
declare const viaRequired: Awaited<Required<I>>;
const fromPartial = viaPartial.items;
const fromRequired = viaRequired.tags;
(fromPartial ?? 'fallback').at(0);
fromRequired.includes(1);

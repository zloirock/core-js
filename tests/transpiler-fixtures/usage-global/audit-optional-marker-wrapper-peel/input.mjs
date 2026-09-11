// `Partial<T>` and a hand-written `{ [K in keyof T]?: T[K] }` say the same thing: the members
// they pass through admit undefined. the peel that unwraps either one has to carry that flag,
// or the fallback branch of `??` is folded away and only the annotated family is served
interface I {
  items: number[];
  tags: number[];
}
declare const wrapped: Partial<I>;
declare const mapped: { [K in keyof I]?: I[K] };
const viaWrapper = wrapped.items;
const viaMapped = mapped.tags;
(viaWrapper ?? 'fallback').at(0);
(viaMapped ?? 'fallback').includes('a');

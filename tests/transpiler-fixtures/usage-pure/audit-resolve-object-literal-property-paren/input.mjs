// `T['k']` indexed access on a generic param with an object literal arg wrapped in a
// TS-cast. the resolver peels the wrapper down to the object literal. without the peel,
// the TS as-cast envelope persists and resolution falls back to the constraint with a
// loss of type precision
function pick<T extends { k: unknown }>(o: T): T['k'] {
  return o.k as T['k'];
}
const result = pick({ k: [1, 2] } as { k: number[] });
result.at(-1);

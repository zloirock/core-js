// @ts-expect-error a binding written ahead of its declaration is the shape under test
export const sealedNonNullWriteRoot = ((held2 = globalThis).window?.self)!.Symbol?.iterator;
let held2: unknown;
export { held2 };

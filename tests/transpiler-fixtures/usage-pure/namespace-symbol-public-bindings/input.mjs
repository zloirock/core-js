// Replacing a private constructor capture keeps it private.
namespace N {
  export const before = effect(), { Set: { [(effect(), Symbol.iterator)]: method } } = globalThis as any,
    { WeakMap: { [(other(), Symbol.iterator)]: fallback = null } } = globalThis as any;
}
N;

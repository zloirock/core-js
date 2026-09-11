// three guarded producers nested in one chain: the inner claim's guard (the root's own polyfill)
// sits UNDER the test of a combined chain that is itself a guarded producer under another one. the
// owner's inners compose into it before its guard prefix hoists, so the claim lands in the test it
// belongs to rather than being carried off raw with the prefix - the build used to abort with the
// prefix stranded. the dead root memo that composition leaves unwraps bare, as the AST leg prints it
let w;
export const plain = globalThis.window?.Array.of(6).flat?.().map?.(x => x).at?.(0).flat?.();
export const hops = globalThis.window?.self?.self.Array.of(6).flat?.().map?.(x => x).at?.(0).flat?.();
export const deeper = globalThis.window?.Array.of(6).flat?.().map?.(x => [x].at(0)).at?.(0).flat?.().at?.(0);
export const kept = (w = globalThis.window)?.Array.of(6).flat?.().map?.(x => x).at?.(0).flat?.().map?.(y => y);
export const staticRoot = globalThis.window?.Array.from([1]).flat?.().map?.(x => x).at?.(0).flat?.().keys?.();

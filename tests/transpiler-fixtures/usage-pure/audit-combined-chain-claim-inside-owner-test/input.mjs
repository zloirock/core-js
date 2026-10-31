// stacked combined dispatches over a probed root: each dispatch reads its receiver plainly past the
// link below it, so the root's probe, the static claim's ponyfill read and every lookup compose into
// ONE test in evaluation order - the build used to abort with a guard prefix stranded between nested
// guards. the dead root memo that composition leaves unwraps bare, as the AST leg prints it
let w;
export const plain = globalThis.window?.Array.of(6).flat?.().map?.(x => x).at?.(0).flat?.();
export const hops = globalThis.window?.self?.self.Array.of(6).flat?.().map?.(x => x).at?.(0).flat?.();
export const deeper = globalThis.window?.Array.of(6).flat?.().map?.(x => [x].at(0)).at?.(0).flat?.().at?.(0);
export const kept = (w = globalThis.window)?.Array.of(6).flat?.().map?.(x => x).at?.(0).flat?.().map?.(y => y);
export const staticRoot = globalThis.window?.Array.from([1]).flat?.().map?.(x => x).at?.(0).flat?.().keys?.();

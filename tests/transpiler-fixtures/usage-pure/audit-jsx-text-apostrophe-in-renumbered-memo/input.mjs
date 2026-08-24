// JSX text holding an apostrophe (or a lone backtick) lands inside a memo the final renumber
// renames: every occurrence must rename together - a renamer that misreads the JSX text as a
// string opener hides every ref after it, keeping the old name while its twin was renamed, so
// the output referenced a ref no declaration printed. the root memo here is dead after the
// rewrite, which is what makes the surviving refs renumber at all
let w;
export const apostrophe = (w = globalThis.window)?.self.Array.of(<li>Don't</li>).flat?.().map?.(x => x).at?.(0);
export const backtick = (w = globalThis.window)?.self.Array.of(<code>`npm i`</code>).flat?.().map?.(x => x).at?.(0);
export const attribute = (w = globalThis.window)?.self.Array.of(<a title="it's">x</a>).flat?.().map?.(x => x).at?.(0);

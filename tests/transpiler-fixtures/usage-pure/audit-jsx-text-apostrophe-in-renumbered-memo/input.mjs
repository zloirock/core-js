// JSX text holding an apostrophe (or a lone backtick) lands inside a memo the final renumber
// renames: the text emitter's lexer must read it as JSX text, not as a string opener that hides
// every ref after it - a hidden occurrence kept the old name while its twin was renamed, so the
// output referenced a ref no declaration printed. the root memo here is dead after composition,
// which is what makes the surviving refs renumber at all
let w;
export const apostrophe = (w = globalThis.window)?.self.Array.of(<li>Don't</li>).flat?.().map?.(x => x).at?.(0);
export const backtick = (w = globalThis.window)?.self.Array.of(<code>`npm i`</code>).flat?.().map?.(x => x).at?.(0);
export const attribute = (w = globalThis.window)?.self.Array.of(<a title="it's">x</a>).flat?.().map?.(x => x).at?.(0);

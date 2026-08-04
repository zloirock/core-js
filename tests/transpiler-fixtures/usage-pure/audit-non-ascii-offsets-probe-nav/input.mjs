// the text emitter slices source by PARSER offsets, so anything that moves bytes, UTF-16 units and
// code points apart is a direct risk to every span the guard render computes. an astral character
// before the nav, inside a comment, in an identifier and INSIDE the rewritten region each shift a
// different one of those counts
// comment with an astral pair: 😀 𝒜
const emoji = '😀𝒜';
const 𝒜 = 'script-capital-a';
globalThis.wideBox = { list: ['ab', 'cd'], n: 4 };
export const beforeNav = globalThis.window?.self.wideBox.list?.at(0);
export const afterIdent = globalThis.window?.self.wideBox.n;
export const escapes = '\u0041\u{1F600}\n\t'.length + (globalThis.window?.self.wideBox.n ?? 0);

// the astral character sits INSIDE the span the render replaces: in a computed key with an effect,
// in a template, and in a call argument
let k = 0;
export const keyWithEffect = globalThis.window?.self.wideBox[(k++, '😀' && 'list')]?.at(0);
export const templateKey = globalThis.window?.self.wideBox[`${ '😀' && 'list' }`]?.at(0);
export const argument = globalThis.window?.self.wideBox.list?.at('😀'.length - 2);
export { emoji, k, 𝒜 };

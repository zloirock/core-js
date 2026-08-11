// the buried root's nav collapses through a VESTIGIAL `?.` and stops at a LIVE one. the two are told
// apart by what the optional guards, not by its presence: an optional over a value that cannot be
// undefined is dead text, one over an unponyfilled hop is the environment probe itself. the first
// spelling of this gate compared two collections of different nodes - the vestigial MEMBERS against
// the optionals' OBJECTS - so membership never held and every `?.` bailed, leaving the nav raw here
// while the AST emitter collapsed it (a diverging import set). one static and one instance method
// per line, so a row that stops resolving shows up in the import set too.
export const deadOptionalRoot = (() => globalThis?.self)()?.window?.Array.of(5).at(0);
export const deadOptionalArg = ((x) => globalThis?.self)(1)?.window?.Object.values({ a: 1 }).includes(1);
export const deadOptionalDeep = (() => globalThis?.self.self)()?.window?.Reflect.ownKeys({ b: 2 }).flat();
export const deadOptionalParen = (() => (globalThis?.self))()?.window?.String.fromCodePoint(99).endsWith('c');

// the same nav without any optional - the collapse has always reached this one
export const plainNav = (() => globalThis.self)()?.window?.Number.parseFloat('1.5').toFixed(1);

// NEGATIVE: the optional guards an unponyfilled hop, so it is load-bearing and the nav stays whole
export const liveOptional = (() => globalThis.window?.self)()?.window?.Promise.resolve(4).finally(() => {});

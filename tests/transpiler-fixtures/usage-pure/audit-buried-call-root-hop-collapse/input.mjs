// the buried root is a proxy NAVIGATION rather than a bare global (`() => globalThis.self`): the render
// that owns the kept call owes it the same hop collapse the natural member rewrite performs outside a
// span, so the value reads the ponyfill leaf. renaming only the root would leave `_globalThis.self` - a
// raw `.self` read, undefined on every engine the ponyfill serves. a hop with no entry of its own has
// nothing to collapse to and keeps the root spelling. one static and one instance method per row, so a
// row that stops resolving leaves a hole in the import set.
export const hopInsideBuriedRoot = (() => globalThis.self)()?.window?.Array.of(5).at(0);
export const hopInsideIdentityArg = (x => x)(globalThis.self)?.window?.Object.entries({ a: 1 }).flat();
export const deepHopInsideBuriedRoot = (() => globalThis.self.self)()?.window?.Object.values({ b: 2 }).includes(2);
export const unponyfillableHopStaysRooted = (() => globalThis.window)()?.window?.Reflect.ownKeys({ c: 3 }).flatMap(k => [k]);

// the same navigation under a static claim and under a ctor-field read: those fold the root into their
// own guard instead of memoizing it, and the collapse has to reach that render too
export const hopUnderStaticClaim = (() => globalThis.self)()?.window?.Array.from([1]);
export const hopUnderCtorField = (x => x)(globalThis.self)?.window?.Number.MAX_SAFE_INTEGER;

// BOUNDARY: the callee is declared above, so the navigation lives outside the rendered span and
// collapses through its own declaration
const above = () => globalThis.self;
export const declaredCalleeNav = above()?.window?.String.fromCodePoint(100).padStart(3, '-');

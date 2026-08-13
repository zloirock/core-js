// a call whose parens hold only trivia is still a ZERO-arg call, so no separator may precede its
// arguments: taking arity from the sliced text instead of the AST emitted `.call(recv, )`, and a
// trailing comma stops the whole module from parsing on the ES5 baseline this method targets.
// one row per renderer that joins arguments after a receiver, since each renders its own separator.
const a = [[1]];
const o = { m: () => [[1]] };

export const standalone = a.flat(/* depth */);
export const parenLookup = (a?.at)(
);
export const optionalCall = a.includes?.( );
export const guardBody = o.m?.(/* none */).flat();
export const hops = a.flat(
).flat(// tail
);
export const combinedInner = a.flat?.(/* none */).at(0);
export const combinedOuter = a.flat?.(
)?.at(
);

class A extends Array {
  static f() {
    return super.from(/* none */);
  }
  // `this` in a static context resolves through the same inherited-static machinery
  static g() {
    return this.of(/* none */);
  }
}
export const inherited = A.f();
export const inheritedViaThis = A.g();

// NEGATIVE: a real argument keeps the separator, whatever trivia sits beside it
export const oneArg = a.flat(/* depth */ 1);
export const trailingTrivia = a.at(0 /* index */);

// NEGATIVE: `new` and the static claim print their slice inside their own parens
export const built = new Map(
);
export const claimed = Array.from(/* nothing */);

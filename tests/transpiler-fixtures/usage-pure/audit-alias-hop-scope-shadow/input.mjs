// a const-alias chain resolves each hop in ITS OWN declaration scope, not the receiver-use
// scope - an inner binding shadowing an intermediate hop (or the winning IIFE call-arg) name
// must not swallow the receiver, so the pure substitution still lands. distinct static per row.
// branching-union hops are usage-global-only (pure requires certainty and bails on a branch),
// so this pure twin locks the single-resolvable forms

// single-static chain (`root -> link -> Array`): an inner param shadows the middle hop, but
// the alias resolves against the module scope where the hop is a const
const arrayRoot = Array;
const arrayLink = arrayRoot;
export function viaStaticChain(arrayRoot) {
  const { of } = arrayLink;
  return of(1, 2);
}

// an IIFE param-default whose winning call-arg is shadowed by an inner var of the same name
// still resolves the arg's static at the call site
export const viaIifeDefault = (({ try: attempt } = Array) => {
  var Promise;
  return attempt;
})(Promise);

// a BLOCK-scoped shadow declared AFTER the alias captured its value must not retype it: the
// alias resolves in its own declaration scope, where the shadow is not yet in scope
const blockRoot = Array;
export function viaBlockShadow() {
  const blockLink = blockRoot;
  {
    const blockRoot = {};
    const { from } = blockLink;
    return from([1]);
  }
}

// a var-hoisted alias whose middle hop is shadowed by a param resolves through the hop's
// module-scope declaration (the hoisted binding falls back to its function scope)
const objRoot = Object;
const objLink = objRoot;
export function viaVarHoist(objRoot) {
  var held = objLink;
  const { groupBy } = held;
  return groupBy([], x => x);
}

// a function-scoped `var` declared in a NESTED block hoists to its function scope: the alias it
// holds must resolve where the var lives, not at the use site - an unrelated block there may
// shadow the hop name (the parsers disagreed here: one hoists natively, the other synthesizes
// the hoisted binding, and both must report the same declaration scope)
const seedRoot = Promise;
const seedLink = seedRoot;
export function viaNestedVarHoist() {
  { var held = seedLink; }
  {
    const seedLink = {};
    const { allSettled } = held;
    return allSettled([]);
  }
}

// a `var` hoists its NAME to the function scope, but its initializer still evaluates in the block
// it is written in: an init name shadowed THERE must win, even though the use sits outside that
// block. resolving the init at the hoisted scope instead would substitute a static onto a value
// that is not the built-in at runtime (the receiver here holds a plain object, so `race` is
// undefined and must stay untouched)
const raceRoot = Promise;
export function viaShadowedInitVar() {
  { const raceRoot = {}; var heldRace = raceRoot; }
  { const { race } = heldRace; return race([]); }
}

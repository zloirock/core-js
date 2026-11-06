// an IIFE param-default destructure receiver arrives as an SE-prefixed BRANCHING call-arg. the arg
// supersedes the runtime-dead default, so usage-global must enumerate the ARG's reachable branches
// and inject each static - not the default's. the leading side effect runs but does not change which
// receiver the branches classify; peeling the sequence tail before the usable-arg gate is what lets
// the enumeration see the branch (the provider path passed the raw arg). distinct method per line
export const a = (({ groupBy } = Object) => groupBy(items, fn))((eff(), c ? Map : WeakMap));
export const b = (({ from } = Array) => from(src))((log(), d ? Date : Iterator));

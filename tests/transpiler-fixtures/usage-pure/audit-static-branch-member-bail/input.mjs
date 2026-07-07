// usage-pure twin of the branching-static member forms: the branch enumeration is a
// usage-global side-effect-import mechanism; pure keeps its bail (substituting a branching
// static member is a separate design decision), so the reads stay raw except the bare
// constructor identifiers each branch substitutes on its own
export const viaTernary = (globalThis.cond ? Array : Iterator).from([1]);
export const viaLogicalOr = (globalThis.maybe || Promise).try;
export const viaIn = 'groupBy' in (globalThis.cond ? Map : Object);

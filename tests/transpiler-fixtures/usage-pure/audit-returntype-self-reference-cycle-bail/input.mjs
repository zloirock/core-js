// a self-referential ReturnType - a function whose declared return IS its own ReturnType (reached
// via `typeof`), or a type alias `() => ReturnType<Self>` - used to recurse forever: every hop of
// the return-type resolution reset the recursion-depth guard, so MAX_DEPTH never fired and the
// stack overflowed. resolution now threads the depth across the re-entry and bails to the GENERIC
// helper (an unresolvable circular type), never crashing. a normal ReturnType still narrows
// precisely - see the other return-type fixtures. distinct methods trace each line to its import.
declare function selfRef(): ReturnType<typeof selfRef>;
declare const viaTypeof: ReturnType<typeof selfRef>;
export const a = viaTypeof.at(0);

type Loop = () => ReturnType<Loop>;
declare const viaAlias: ReturnType<Loop>;
export const b = viaAlias.includes("z");

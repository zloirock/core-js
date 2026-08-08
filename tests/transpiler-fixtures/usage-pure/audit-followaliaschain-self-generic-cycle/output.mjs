import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Self-referencing generic alias `type Self<T> = Self<T[]>` would loop forever expanding
// the body. followTypeAliasChain `visited` set keys on decl identity, so the second hop
// hits the same TSTypeAliasDeclaration and breaks the loop. Resolution terminates and
// falls back to generic dispatch
type Self<T> = Self<T[]>;
declare const v: Self<number>;
_at(v).call(v, 0);
_includes(v).call(v, 1);
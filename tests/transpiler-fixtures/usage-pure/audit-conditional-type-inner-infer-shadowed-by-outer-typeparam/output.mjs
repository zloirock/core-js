import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// outer alias typeparam `T` shadows inner `infer T` in the conditional type body.
// without dropping `T` from the subst before walking trueType, the outer typearg
// (`Array<string>`) would leak into the inner `infer T` slot, breaking the alpha-rename
// guarantee. with the guard, the inner infer correctly binds to the element type
// (`string`) and downstream `.at(0)` narrows to the string-specific polyfill
type ArrayElem<T> = T extends Array<infer T> ? T : never;
declare function makeArr(): ArrayElem<Array<string>>;
const x = makeArr();
_atMaybeString(x).call(x, 0);
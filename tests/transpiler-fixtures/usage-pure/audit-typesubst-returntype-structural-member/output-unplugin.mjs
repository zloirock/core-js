import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// `ReturnType<Fn>` of a generic alias whose function has a signature-local `<T>` and returns a STRUCTURAL
// type (`<T>() => { x: T }`): resolving a member of that ReturnType goes through the member-
// enumeration path, which must shadow the `<T>` before folding the alias subst - else the enclosing
// `Fn<string[]>` captures it and `r.x` resolves to `string[]`, injecting the array-specific helper on a value
// that is NOT an array (the real return is the signature-local, unconstrained). shadowed -> unknown, usage-
// pure bails. an ALIAS-level `T` (no signature-local) IS the real return, so it keeps the array narrow. a
// method-resolution-only delta - babel and unplugin share the provider verdict, so no sidecar

type Shadowed<T> = <T>() => { x: T };
declare const r: ReturnType<Shadowed<string[]>>;

// signature-local <T> shadowed -> r.x is unknown -> no wrong array-Maybe helper injected
_at(_ref = r.x).call(_ref, 0);

type AliasT<T> = () => { x: T };
declare const r2: ReturnType<AliasT<string[]>>;

// alias-level T (no inner <T>) IS the structural return type -> real array narrow
_includesMaybeArray(_ref2 = r2.x).call(_ref2, "a");
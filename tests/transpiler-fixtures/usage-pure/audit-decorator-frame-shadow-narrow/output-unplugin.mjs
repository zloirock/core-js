import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// same-name shadows inside a decorator inline function resolve POSITION-aware through the
// decorator-subtree frame scope: a use outside a nested block reads the param, not the
// innermost-walked entry. an untyped param stays generic even with a typed nested shadow
declare function dec(fn: unknown): any;
@dec((x) => { { let x = 's'; } return _at(x).call(x, 0); }) export class A {}

// a typed param keeps ITS narrow against a differently-typed nested shadow
@dec((x: string) => { { let x = [1, 2]; } return _includesMaybeString(x).call(x, 'a'); }) export class B {}

// control: no nested shadow - the param narrow applies directly
@dec((x: string) => { return _atMaybeString(x).call(x, 1); }) export class C {}
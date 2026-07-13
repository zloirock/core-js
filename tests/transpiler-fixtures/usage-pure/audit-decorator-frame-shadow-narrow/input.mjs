// same-name shadows inside a decorator inline function resolve POSITION-aware through the
// decorator-subtree frame scope: a use outside a nested block reads the param, not the
// innermost-walked entry. an untyped param stays generic even with a typed nested shadow
declare function dec(fn: unknown): any;
@dec((x) => { { let x = 's'; } return x.at(0); }) export class A {}

// a typed param keeps ITS narrow against a differently-typed nested shadow
@dec((x: string) => { { let x = [1, 2]; } return x.includes('a'); }) export class B {}

// control: no nested shadow - the param narrow applies directly
@dec((x: string) => { return x.at(1); }) export class C {}

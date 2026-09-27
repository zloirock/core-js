// Flow ambient classes have signatures instead of runtime method bodies. Every row asks for
// the receiver type directly; the TS spellings are controls, not the oracle for Flow.
import { adapters, babelAdapter, createChecker } from './harness.mjs';

const { check, fail, finish } = createChecker('flow-class-members');
const cases = [
  ['instance method', 'declare class C { m(): number[] } new C().m().at(0);', 'Array'],
  ['static method', 'declare class C { static m(): string } C.m().at(0);', 'string'],
  ['instance field', 'declare class C { items: string } new C().items.at(0);', 'string'],
  ['static field', 'declare class C { static items: number[] } C.items.at(0);', 'Array'],
  ['callable field', 'declare class C { m: () => string } new C().m().at(0);', 'string'],
  ['getter', 'declare class C { get items(): number[] } new C().items.at(0);', 'Array'],
  ['callable getter', 'declare class C { get m(): () => string } new C().m().at(0);', 'string'],
  ['inherited instance', 'declare class B { m(): string } declare class C extends B {} new C().m().at(0);', 'string'],
  ['inherited static', 'declare class B { static m(): number[] } declare class C extends B {} C.m().at(0);', 'Array'],
  ['two generic hops', 'declare class B<T> { m(): T } declare class M<U> extends B<U> {} declare class C extends M<number[]> {} new C().m().at(0);', 'Array'],
  ['typeof aliased static field', 'declare class C { static items: string } const D = C; function f(x: typeof D.items) { x.at(0); }', 'string'],
  // Intentionally inconsistent override: the ancestor own field still shadows the prototype.
  ['ancestor own callable field', 'declare class B { m: () => number[] } declare class C extends B { m(): string } new C().m().at(0);', 'Array'],
  ['ancestor proto callable field', 'declare class B { proto m: () => (number[] | string) } declare class C extends B { m(): string } new C().m().at(0);', 'string', 'flow'],
  ['generic rest default', 'declare class C { m<T = number[]>(...xs: T[]): T } new C().m("abc").at(0);', 'string'],
  ['generic rest spread', 'declare class C { m<T = number[]>(...xs: T[]): T } new C().m(...["abc"]).at(0);', 'string'],
  ['generic callback rest opaque', 'declare class C { m<T = number[]>(fn: (...xs: T[]) => void): T } function f(fn: any) { new C().m(fn).at(0); }', null],
  ['thenable callable field', 'declare class C { then: (cb: (value: string) => void) => void } async function f(c: C) { (await c).at(0); }', 'string'],
  ['generic rest opaque', 'declare class C { m<T = number[]>(...xs: T[]): T } function f(x: any) { new C().m(x).at(0); }', null],
  ['generic method', 'declare class C { m<T>(x: T): T } new C().m([1]).at(0);', 'Array'],
  ['generic default', 'declare class C<T = string> { m(): T } new C().m().at(0);', 'string'],
  ['overload arity', 'declare class C { m(x: string): string; m(x: string, y: number): number[] } new C().m("x").at(0);', 'string'],
  ['overload second arm', 'declare class C { m(x: string): string; m(x: string, y: number): number[] } new C().m("x", 1).at(0);', 'Array'],
  ['rest overload', 'declare class C { m(x: string, ...ys: number[]): number[]; m(): string } new C().m("x", 1).at(0);', 'Array'],
  ['optional overload', 'declare class C { m(x?: number): number[]; m(x: string): string } new C().m().at(0);', 'Array'],
  ['typeof generic function', 'function id<T>(x: T): T { return x; } function read(fn: typeof id<string>) { fn("abc").at(0); }', 'string'],
  ['typeof generic function alias', 'function id<T>(x: T): T { return x; } type F<U> = typeof id<U>; function read(fn: F<string>) { fn("abc").at(0); }', 'string'],
  ['typeof alias', 'declare class C { static m(): string } type F = typeof C.m; function f(m: F) { m().at(0); }', 'string'],
  ['alias', 'declare class B { m(): number[] } const C = B; new C().m().at(0);', 'Array'],
  ['stored instance', 'declare class C { m(): string } const c = new C(); c.m().at(0);', 'string'],
  ['Reflect.construct', 'declare class C { m(): number[] } Reflect.construct(C, []).m().at(0);', 'Array'],
  ['Reflect new target', 'declare class B { m(): string } declare class C { m(): number[] } Reflect.construct(B, [], C).m().at(0);', 'Array'],
  ['runtime child', 'declare class B { m(): number[] } class C extends B {} new C().m().at(0);', 'Array'],
  ['super method', 'declare class B { m(): string } class C extends B { f() { return super.m().at(0); } }', 'string'],
  ['this method', 'declare class B { m(): string } class C extends B { f() { return this.m().at(0); } }', 'string'],
  ['native array base', 'declare class C extends Array<string> {} new C().at(0);', 'Array'],
  ['native array grandparent', 'declare class B extends Array<string> {} declare class C extends B {} new C().at(0);', 'Array'],
  ['annotation route', 'declare class C { m(): number[] } function f(c: C) { c.m().at(0); }', 'Array'],
  ['typeof static field', 'declare class C { static items: string } function f(x: typeof C.items) { x.at(0); }', 'string'],
  ['typeof static method', 'declare class C { static m(): number[] } function f(m: typeof C.m) { m().at(0); }', 'Array'],
  // Deliberately invalid when the callable is present; absence must still reach the string fallback.
  ['optional callable fallback', 'declare class C { m?: () => number[] } (new C().m || "abc").at(0);', null],
  ['union return', 'declare class C { m(): number[] | string } new C().m().at(0);', null],
  ['missing member', 'declare class C {} new C().m().at(0);', null],
  ['setter only', 'declare class C { set items(x: string): void } new C().items.at(0);', null],
  // Deliberately invalid sources include the missing-member/setter reads and cycles below.
  // Cycles must terminate, and observed writes must not
  // retain a stale signature even when a typechecker would reject the replacement.
  ['cyclic heritage', 'declare class B extends C {} declare class C extends B {} new C().m().at(0);', null],
  ['written instance method', 'declare class C { m(): number[] } C.prototype.m = () => "s"; new C().m().at(0);', null],
  ['written static method', 'declare class C { static m(): number[] } C.m = () => "s"; C.m().at(0);', null],
  ['shadowed class', 'declare class C { m(): number[] } function f(C: any) { new C().m().at(0); }', null],
];

for (const [name, source, expected, dialect] of cases) {
  for (const [adapter, plugins] of [[babelAdapter, ['flow']], ...adapters.map(a => [a, ['typescript']])]) {
    if (dialect && plugins[0] !== dialect) continue;
    const label = `${ name } [${ adapter.name } ${ plugins[0] }]`;
    try {
      const program = adapter.parseAndScope(source, 'module', plugins);
      const member = adapter.pickPath(program, 'MemberExpression', p => p.node.property?.name === 'at');
      const type = adapter.makeResolver().resolveNodeType(member.get('object'));
      const family = type?.primitive && type.type === 'string' ? 'string' : type?.constructor ?? null;
      check(label, family, expected);
    } catch (error) {
      fail(label, error.message);
    }
  }
}
finish();

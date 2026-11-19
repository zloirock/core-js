// TypeScript call inference and virtual dispatch must not select a foreign instance family.
import { createChecker } from './harness.mjs';

const { check, runBoth, finish } = createChecker('type-call-contracts');
const cases = [];

for (const [kind, constraint, yes, no] of [
  ['string', "'lines' | 'text'", "'lines'", "'text'"],
  ['number', 'number', '-1', '2'],
  ['boolean', 'boolean', 'true', 'false'],
  ['bigint', 'bigint', '1n', '2n'],
  ['negative bigint', 'bigint', '-1n', '2n'],
]) {
  for (const [spelling, setup, arg] of [
    ['literal', '', yes],
    ['const', `const choice = ${ yes };`, 'choice'],
    ['alias', `const original = ${ yes }; const choice = original;`, 'choice'],
    ['wrapped', '', `(${ yes } as const)`],
  ]) {
    cases.push([`${ kind }/${ spelling }`, `
      declare function read<T extends ${ constraint }>(value: T): T extends ${ yes } ? number[] : string;
      ${ setup }
      read(${ arg }).at(-1);`, 'Array']);
  }
  cases.push([`${ kind }/false`, `
    declare function read<T extends ${ constraint }>(value: T): T extends ${ yes } ? number[] : string;
    read(${ no }).at(-1);`, 'string']);
}
cases.push(
  ['const type parameter', "declare function read<const T>(value: T): T extends 'lines' ? number[] : string; read('lines').at(0);", 'Array'],
  ['unconstrained widening', "declare function read<T>(value: T): T extends 'lines' ? number[] : string; read('lines').at(0);", 'string'],
  ['object constraint widening', "declare function read<T extends {}>(value: T): T extends 'lines' ? number[] : string; read('lines').at(0);", 'string'],
  ['mixed primitive constraint', "declare function read<T extends string | number>(value: T): T extends 'lines' ? number[] : string; read('lines').at(0);", 'Array'],
  ['aliased primitive constraint',
    "type Mode = 'lines' | 'text'; declare function read<T extends Mode>(value: T): T extends 'lines' ? number[] : string; read('lines').at(0);", 'Array'],
  ['method literal substitution',
    "class Box<T extends string> { constructor(value: T) {} get(): T extends 'lines' ? number[] : string { return null as any; } } new Box('lines').get().at(0);", 'Array'],
  ['member literal substitution', "declare function read<T extends string>(value: T): { rows: T extends 'lines' ? number[] : string }; read('lines').rows.at(0);", 'Array'],
  ['constraint declaration scope',
    "type Mode = 'lines' | 'text'; declare function read<T extends Mode>(value: T): { rows: T extends 'lines' ? number[] : string }; "
      + "function local() { type Mode = {}; return read('lines').rows.at(0); }", 'Array'],
  ['class constraint scope',
    "type Mode = 'lines' | 'text'; "
      + "class Box<T extends Mode> { constructor(value: T) {} get(): T extends 'lines' ? number[] : string { return null as any; } } "
      + "function local() { type Mode = {}; return new Box('lines').get().at(0); }", 'Array'],
  ['template literal argument', "declare function read<T extends string>(value: T): T extends 'lines' ? number[] : string; read(`lines`).at(0);", 'Array'],
  ['wide asserted argument', "declare function read<T extends string>(value: T): T extends 'lines' ? number[] : string; read('lines' as string).at(0);", 'string'],
  ['wide declared argument',
    "declare function read<T extends string>(value: T): T extends 'lines' ? number[] : string; const choice: string = 'lines'; read(choice).at(0);", 'string'],
  ['wide aliased annotation',
    "type Mode = string; declare function read<T extends string>(value: T): { rows: T extends 'lines' ? number[] : string }; "
      + "const choice: Mode = 'lines'; read(choice).rows.at(0);", 'string'],
  ['satisfies keeps literal',
    "declare function read<T extends string>(value: T): T extends 'lines' ? number[] : string; const choice = 'lines' satisfies string; read(choice).at(0);", 'Array'],
  ['satisfies keeps inner assertion',
    "declare function read<T extends string>(value: T): T extends 'lines' ? number[] : string; read(('lines' as string) satisfies string).at(0);", 'string'],
  ['declared literal argument',
    "declare function read<T extends string>(value: T): T extends 'lines' ? number[] : string; declare const choice: 'lines'; read(choice).at(0);", 'Array'],
  ['recursive argument annotation budget', `
    declare function read<T extends string>(value: T): { rows: T };
    // @ts-expect-error A recursive initializer must terminate analysis without a claimed type.
    const value = read(value).rows;
    value.at(0);`, null],
  ['non-null satisfies wrapper',
    'declare function read(value: string): number[]; declare function read(value: string | undefined): string; '
      + 'declare const value: string | undefined; read((value!) satisfies string).at(0);', 'Array'],
  ['nullable assertion after non-null',
    'declare function read(value: string): number[]; declare function read(value: string | undefined): string; '
      + 'declare const value: string | undefined; read(value! as string | undefined).at(0);', null],
  ['unknown boolean call', 'declare function read<T extends boolean>(value: T): T extends true ? number[] : string; declare const flag: boolean; read(flag).at(0);', null],
  ['boolean alias', 'type Result<T> = T extends true ? number[] : string; declare const value: Result<boolean>; value.at(0);', null],
  ['boolean member', 'type Result<T> = T extends true ? { rows: number[] } : { rows: string }; declare const value: Result<boolean>; value.rows.at(0);', null],
  ['boolean alias chain', 'type Result<T> = T extends true ? number[] : string; type Forward<U> = Result<U>; declare const value: Forward<boolean>; value.at(0);', null],
  ['awaited boolean alias', 'type Result<T> = T extends true ? Promise<number[]> : Promise<string>; declare const value: Awaited<Result<boolean>>; value.at(0);', null],
  ['awaited boolean member',
    'type Result<T> = T extends true ? { rows: Promise<number[]> } : { rows: Promise<string> }; declare const value: Awaited<Result<boolean>["rows"]>; value.at(0);', null],
  ['boolean equal families', 'type Result<T> = T extends true ? number[] : string[]; declare const value: Result<boolean>; value.at(0);', 'Array'],
  ['boolean direct', 'declare const value: boolean extends true ? number[] : string; value.at(0);', 'string'],
  ['boolean tuple', 'type Result<T> = [T] extends [true] ? number[] : string; declare const value: Result<boolean>; value.at(0);', 'string'],
  ['boolean true', 'type Result<T> = T extends true ? number[] : string; declare const value: Result<true>; value.at(0);', 'Array'],
  ['boolean false', 'type Result<T> = T extends true ? number[] : string; declare const value: Result<false>; value.at(0);', 'string'],
);
for (const parameter of ['public value: T', 'private value: T', 'readonly value: T', 'public value: T = null as any']) {
  cases.push([`parameter property/${ parameter }`, `class Box<T = string> {
    constructor(${ parameter }) {} get(): T { return this.value; }
  } new Box([1, 2]).get().at(0);`, 'Array']);
}
for (const member of [
  "value(): string | number[] { return 'ab'; }",
  "get value(): () => string | number[] { return () => 'ab'; }",
  "value: () => string | number[] = () => 'ab';",
]) {
  cases.push([`virtual/${ member }`, `class Base { ${ member } }
    export function last(value: Base) { return value.value().at(0); }`, null]);
}
cases.push(
  ['exact class call', "class Base { value(): string | number[] { return 'ab'; } } new Base().value().at(0);", 'string'],
  ['inferred method contract', "class Base { value() { return 'ab'; } } export function last(value: Base) { return value.value().at(0); }", 'string'],
  ['private exact method', "class Base { #value(): string | number[] { return 'ab'; } last() { return this.#value().at(0); } }", 'string'],
  ['private exact getter', "class Base { get #value(): () => string | number[] { return () => 'ab'; } last() { return this.#value().at(0); } }", 'string'],
  ['exact super call', "class Base { value(): string | number[] { return 'ab'; } } class Child extends Base { last() { return super.value().at(0); } }", 'string'],
  ['ordinary function body', "function read(): string | number[] { return 'ab'; } read().at(0);", 'string'],
);
for (const nullable of ['string | undefined', 'string | null']) {
  for (const host of ['ambient', 'interface', 'class']) {
    const signatures = `read(value: string): number[]; read(value: ${ nullable }): string;`;
    const declaration = host === 'ambient' ? `declare function read(value: string): number[];
      declare function read(value: ${ nullable }): string;`
      : `${ host === 'interface' ? 'interface' : 'declare class' } Reader { ${ signatures } } declare const reader: Reader;`;
    for (const asserted of [false, true]) {
      cases.push([`nullable/${ nullable }/${ host }/${ asserted }`, `${ declaration }
        declare const value: ${ nullable };
        ${ host === 'ambient' ? '' : 'reader.' }read(value${ asserted ? '!' : '' }).at(0);`, asserted ? 'Array' : null]);
    }
  }
}
for (const host of ['ambient', 'interface', 'class']) {
  const signatures = "read(value: string): string; read(value: string, key?: 'rows'): number[];";
  const declaration = host === 'ambient' ? `declare function read(value: string): string;
    declare function read(value: string, key?: 'rows'): number[];`
    : `${ host === 'interface' ? 'interface' : 'declare class' } Reader { ${ signatures } } declare const reader: Reader;`;
  cases.push([`specialized/${ host }`, `${ declaration } ${ host === 'ambient' ? '' : 'reader.' }read('s').at(0);`, 'Array']);
}

for (const [name, source, expected] of cases) {
  runBoth(name, source, (adapter, program, label) => {
    const member = adapter.pickPath(program, 'MemberExpression', p => p.node.property?.name === 'at');
    const resolver = adapter.makeResolver();
    const result = resolver.resolveNodeType(member.get('object'));
    check(label, result?.primitive ? result.type : result?.constructor ?? null, expected);
    check(`${ label } repeated`, resolver.resolveNodeType(member.get('object')), result);
  });
}
finish();

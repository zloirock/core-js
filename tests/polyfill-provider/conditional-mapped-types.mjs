// Conditional and mapped types select the receiver family on both parser representations.
import { createChecker } from './harness.mjs';

const { check, runBoth, finish } = createChecker('conditional-mapped-types');

function family(name, source, expected) {
  runBoth(name, `export {};\n${ source }`, (adapter, program, label) => {
    const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const result = adapter.makeResolver().resolveNodeType(member.get('object'));
    check(label, result?.primitive ? result.type : result?.constructor ?? null, expected);
  });
}

for (const [name, tested, expected] of [
  ['disjoint weak target', '{ id: string } extends { label?: string }', 'string'],
  ['empty source and weak target', '{} extends { label?: string }', 'Array'],
  ['common optional member', '{ label: string } extends { label?: string }', 'Array'],
  ['boolean is covered', 'boolean extends true | false', 'Array'],
  ['boolean partially covered', 'boolean extends true', 'string'],
  ['record property coercion', "Record<1, string> extends Record<'1', string>", 'Array'],
  ['record distinct property', "Record<1, string> extends Record<'01', string>", 'string'],
  ['readonly properties on Map', 'Readonly<Map<string, number>> extends Map<string, number>', 'Array'],
  ['readonly view of Map', 'ReadonlyMap<string, number> extends Map<string, number>', 'string'],
  ['thenable', 'PromiseLike<number> extends Promise<number>', 'string'],
  ['promise', 'Promise<number> extends PromiseLike<number>', 'Array'],
  ['uppercase union', "Uppercase<'a' | 'b'> extends 'A' | 'B'", 'Array'],
  ['map iteration', 'Map<string, number> extends Iterable<infer E extends string>', 'string'],
  ['map iteration pair', 'Map<string, number> extends Iterable<infer E extends unknown[]>', 'Array'],
]) family(name, `type Out = ${ tested } ? number[] : string; declare const value: Out; value.at(0);`, expected);

for (const [name, value, key, expected] of [
  ['unbounded keyof', 'Record<string, number[]>', 'keyof T', null],
  ['narrow string keyof', 'Record<string, number[]>', 'keyof T & string', 'Array'],
  ['narrow number keyof', 'Record<string, number[]>', 'keyof T & number', 'Array'],
  ['all property keys', 'Record<PropertyKey, number[]>', 'keyof T', 'Array'],
  ['separate string and symbol index', '{ [k: string]: string; [k: symbol]: number[] }', 'keyof T', null],
  ['separate symbol index', '{ [k: string]: string; [k: symbol]: number[] }', 'keyof T & symbol', 'Array'],
]) family(name, `function read<T extends ${ value }>(v: T[${ key }]) { return v.at(0); }`, expected);

for (const [name, sourceType, expected] of [
  ['computed member', '{ [key]: number[]; other: string }', null],
  ['matching template', '{ first: number[]; second: string[] }', 'Array'],
  ['different template values', '{ first: number[]; second: string }', null],
]) {
  family(name, `const key = 'first' as const;
    type Source = ${ sourceType };
    type M = { [K in keyof Source as \`data_\${string}\`]: Source[K] };
    declare const value: M; value.data_row.at(0);`, expected);
}

for (const [name, first, second] of [
  ['promises', 'Promise<string>', 'PromiseLike<string>'],
  ['readonly arrays', 'Array<string>', 'ReadonlyArray<string>'],
]) for (const [a, b] of [[first, second], [second, first]]) {
  const target = name === 'promises' ? 'Promise<string>' : 'Array<string>';
  family(`${ name }/${ a }/distributed`,
    `type Pick<T> = T extends ${ target } ? number[] : string; declare const value: Pick<${ a } | ${ b }>; value.at(0);`, null);
  family(`${ name }/${ a }/fixed`,
    `type Pick = (${ a } | ${ b }) extends ${ target } ? number[] : string; declare const value: Pick; value.at(0);`, 'string');
}

for (const [wide, narrow, checkType] of [['Object', 'object', 'string'], ['Function', '(() => string)', '(() => number)']]) {
  for (const [a, b] of [[wide, narrow], [narrow, wide]]) {
    family(`nested upper bound/${ a }/${ b }`, `type Element<T> = T extends Array<infer U> ? U : never;
      type R = ${ checkType } extends Element<Array<${ a }> | Array<${ b }>> ? string : number[];
      declare const value: R; value.at(0);`, 'string');
  }
}

for (const type of ['string[]', 'readonly string[]', '[string, number]', 'Array<string>']) {
  family(`same instantiation/${ type }`, `type Box<T> = T;
    type Copy = { [K in keyof Box<${ type }>]: Box<${ type }>[K] };
    type R = Copy extends ${ type } ? string : number[]; declare const value: R; value.at(0);`, 'string');
}

family('inline keyof source with reordered names',
  'declare const value: { a: number[]; b: string[] }[keyof { b: string[]; a: number[] }]; value.at(0);', 'Array');

family('two inferred map parameters',
  'type Pick<T> = T extends Map<infer K, infer V> ? [K, V] : never; declare const value: Pick<Map<string, number[]>>; value[1].at(0);', 'Array');
family('rejected inferred member',
  'type Pick<T> = T extends (infer U extends string)[] ? { item: U } : { item: number[] }; declare const value: Pick<number[]>; value.item.at(0);', 'Array');
family('admitted inferred member',
  'type Pick<T> = T extends (infer U extends string)[] ? { item: U } : { item: number[] }; declare const value: Pick<string[]>; value.item.at(0);', 'string');
family('mutable array infer alias rejects a readonly check',
  'type Mutable<T> = T[]; type P<T> = T extends Mutable<infer E> ? { item: string } : { item: number[] }; '
    + 'declare const value: P<readonly string[]>; value.item.at(0);', 'Array');
family('unresolved conditional member',
  'function read<T>(v: T extends string ? { item: string } : { item: number[] }) { return v.item.at(0); }', null);

for (const [name, source, expected] of [
  ['cross projection', '{ [K in keyof Box<{ length: unknown }>]: Box<string[]>[K] }', 'Array'],
  ['length projection', "Pick<string[], 'length'>", 'Array'],
  ['literal keys', "Record<0 | 'length', number>", 'Array'],
  ['remapped length', "{ [K in 'first' | 'second' as 'length']: number }", 'Array'],
  ['full projection', 'Pick<string[], keyof string[]>', 'string'],
  ['homomorphic projection', '{ [K in keyof Box<string[]>]: Box<string[]>[K] }', 'string'],
]) family(name, `type Box<T> = T; type View = ${ source }; type R = View extends readonly unknown[] ? string : number[];
  declare const value: R; value.at(0);`, expected);

family('projection supplied by the caller', `type Choose<T> = T extends readonly unknown[] ? string : number[];
  declare const value: Choose<Pick<string[], 'length'>>; value.at(0);`, 'Array');
family('aliased projection key', `type Key = 'length'; type View = Pick<string[], Key>;
  declare const value: View extends readonly unknown[] ? string : number[]; value.at(0);`, 'Array');
family('union of named projection keys', `type L = 'length'; type J = 'join'; type View = Pick<string[], L | J>;
  declare const value: View extends readonly unknown[] ? string : number[]; value.at(0);`, 'Array');
family('open projection may select the full array', `type Choose<K extends keyof string[]> = Pick<string[], K> extends readonly unknown[] ? string : number[];
  function read<K extends keyof string[]>(value: Choose<K>) { return value.at(0); }`, null);
family('default projection from the declaration', `type Key = 'length'; type Choose<T = Pick<string[], Key>> = T extends readonly unknown[] ? string : number[];
  declare const value: Choose; value.at(0);`, 'Array');
family('parameter shadows the finite outer shape', `type T = { length: number }; type Choose<T> = T extends unknown[] ? string : number[];
  declare const value: Choose<string[]>; value.at(0);`, 'string');
family('open parameter may itself be an array', `type Choose<T> = T extends readonly unknown[] ? string : number[];
  export function run<T extends { length: number }>(value: Choose<T>) { return value.at(0); }`, null);

finish();

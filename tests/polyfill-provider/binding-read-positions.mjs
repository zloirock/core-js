// Binding reads keep their lexical position through type and class-alias queries.
import { createChecker } from './harness.mjs';
import { closestVisibleNativeBinding, withoutPhantomDeclarationViolations } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { varScopeBlockOfBinding } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { runBoth, check, finish } = createChecker('binding-read-positions');
function visibleBinding(scope, name, path) {
  const binding = closestVisibleNativeBinding(scope, name, path);
  return binding && withoutPhantomDeclarationViolations(binding);
}
const bodies = [
  ["const key = 'slot'; const box = { [key]: 'abc' }; const result = box.slot;", 'string'],
  ["const key = 'slot'; const { [key]: result } = { slot: 'abc' };", 'string'],
  ["const key = 'slot'; let held; ({ [key]: held } = { slot: 'abc' }); const result = held;", 'string'],
  ["const key = 'slot'; let held; ({ outer: { [key]: held } } = { outer: { slot: 'abc' } }); const result = held;", 'string'],
  ["function key() { return 'slot'; } const box = { [key()]: 'abc' }; const result = box.slot;", 'string'],
  ["class C { value = 'abc'; } const c = new C(); const result = c.value;", 'string'],
  ["class Base { value = 'abc'; } const Parent = Base; class C extends Parent {} const result = new C().value;", 'string'],
  ["const box = { get value() { return ['abc']; } }; const result = box.value;", 'Array'],
];
for (const [host, wrap] of [
  ['module', body => body],
  ['static', body => `class Outer { static { ${ body } } }`],
  ['namespace', body => `namespace Outer { ${ body } }`],
]) for (const [body, expected] of bodies) {
  runBoth(`${ host }/${ body }`, `export {}; ${ wrap(body) }`, (parser, program, label) => {
    const target = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
    const read = target ? target.get('init')
      : parser.pickPath(program, 'Identifier', p => p.node.name === 'result');
    let contextual = 0;
    const resolver = parser.makeResolver({
      getScopeBinding(scope, name, path) {
        const binding = closestVisibleNativeBinding(scope, name, path);
        if (binding && varScopeBlockOfBinding(binding)) {
          if (!path) return null;
          contextual++;
        }
        return binding && withoutPhantomDeclarationViolations(binding);
      },
    });
    const type = resolver.resolveNodeType(read);
    check(label, type ? type.primitive ? type.type : type.constructor : null, expected);
    if (host !== 'module' && !body.startsWith('const box =')) check(`${ label }/position`, contextual > 0, true);
  });
}
for (const declaration of [
  "{ var key = 'slot'; }",
  "try { var key = 'slot'; } finally {}",
  "label: { var key = 'slot'; }",
  "for (var key = 'slot';;) break;",
  "switch (1) { case 1: var key = 'slot'; }",
]) runBoth(declaration, `function read() { ${ declaration } const box = { [key]: 'abc' }; const result = box.slot; }`,
  (parser, program, label) => {
    const target = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
    const type = parser.makeResolver({ getScopeBinding: (scope, name, path) => visibleBinding(scope, name, path) }).resolveNodeType(target.get('init'));
    check(label, type?.primitive ? type.type : type?.constructor, 'string');
  });
for (const [label, source, expected] of [
  ['static outside', "const key = 'slot'; class C { static { const key = 'other'; } } const box = { [key]: 'abc', other: [] }; const result = box.slot;", 'string'],
  ['namespace outside', "const key = 'slot'; namespace N { const key = 'other'; } const box = { [key]: 'abc', other: [] }; const result = box.slot;", 'string'],
  ['initializer scope', "const key = 'slot'; const box = { [key]: 'abc' }; class C { static { const key = 'other'; const result = box.slot; } }", 'string'],
  ['initializer static scope', "class C { static { const key = 'slot'; const box = { [key]: 'abc' }; { const key = 'other'; const result = box.slot; } } }", 'string'],
  ['late key', '// @ts-expect-error the key is intentionally read before its initialization\n'
    + "const box = { [key]: 'abc', other: [] }; const key = 'other'; const result = box.other;", 'Array'],
]) runBoth(label, `export {}; ${ source }`, (parser, program, testName) => {
  const target = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
  const type = parser.makeResolver({ getScopeBinding: (scope, name, path) => visibleBinding(scope, name, path) }).resolveNodeType(target.get('init'));
  check(testName, type ? type.primitive ? type.type : type.constructor : null, expected);
});
runBoth('context lifetime', `export {};
class First { static { const key = 'slot'; const box = { [key]: 'abc' }; const a = box.slot; } }
class Second { static { const key = 'items'; const box = { [key]: [1] }; const b = box.items; } }
`, (parser, program, label) => {
  let fail = true;
  const resolver = parser.makeResolver({
    getScopeBinding(scope, name, path) {
      if (fail && name === 'box') {
        fail = false;
        throw new Error('lookup failure');
      }
      return visibleBinding(scope, name, path);
    },
  });
  const a = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'a').get('init');
  const b = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'b').get('init');
  let message;
  try {
    resolver.resolveNodeType(a);
  } catch (error) {
    message = error.message;
  }
  check(`${ label }/error`, message, 'lookup failure');
  for (const [name, read, expected] of [['b', b, 'Array'], ['a', a, 'string'], ['b cached', b, 'Array']]) {
    const type = resolver.resolveNodeType(read);
    check(`${ label }/${ name }`, type ? type.primitive ? type.type : type.constructor : null, expected);
  }
});
for (const [parameter, value] of [
  ['value: ReturnType<typeof convert>', 'value'],
  ["value: ReturnType<typeof convert> = 'abc'", 'value'],
  ['...values: ReturnType<typeof convert>[]', 'values[0]'],
  ['value: ReturnType<typeof convert>', 'null! as typeof value'],
  ['box: { value: ReturnType<typeof convert> }', 'null! as typeof box.value'],
  ['box: { read(): ReturnType<typeof convert> }', 'null! as ReturnType<typeof box.read>'],
  ['[value]: ReturnType<typeof convert>[]', 'value'],
  ["[value]: ReturnType<typeof convert>[] = ['abc']", 'value'],
  ['{ value }: { value: ReturnType<typeof convert> }', 'value'],
  ["{ value }: { value: ReturnType<typeof convert> } = { value: 'abc' }", 'value'],
]) {
  runBoth(`annotation overload scope/${ parameter }`, `export {};
declare function convert(value: number): number[];
function read(${ parameter }) {
  function convert(input: string) { return input; }
  const result = ${ value };
}`, (parser, program, label) => {
    const read = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const type = parser.makeResolver({ getScopeBinding: visibleBinding }).resolveNodeType(read);
    check(label, type?.primitive ? type.type : type?.constructor, 'string');
  });
}
for (const [name, body] of [
  ['parameter-property', 'class Box { constructor(public value: ReturnType<typeof convert>) { function convert(x: string) { return x; } const result = value; } }'],
  ['parameter-property-default', `class Box { constructor(public value: ReturnType<typeof convert> = 'abc') {
  function convert(x: string) { return x; } const result = value;
} }`],
  ['method-default', 'class Box { read(value: ReturnType<typeof convert> = \'abc\') { function convert(x: string) { return x; } const result = value; } }'],
]) {
  runBoth(name, `export {}; declare function convert(x: number): number[]; ${ body }`, (parser, program, label) => {
    const read = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const type = parser.makeResolver({ getScopeBinding: visibleBinding }).resolveNodeType(read);
    check(label, type?.primitive ? type.type : type?.constructor, 'string');
  });
}
finish();

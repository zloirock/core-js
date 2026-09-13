// A retained getter can keep unrelated locals while exposing its possible returned value.
// Reading a getter-local binding never proves the same-spelled name in the container's scope.
import { objectPropertyReadValue, singleReturnBodyExpression, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { findNamespaceMemberValue } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('retained-getter-locals');

const rows = [
  ['local observation', 'const type = typeof Value; mark(type); return globalThis;', 'globalThis'],
  ['destructured local effect', 'const { value = mark() } = source; return globalThis;', 'globalThis'],
  ['returned local', 'const globalThis = other; return globalThis;', null],
  ['nested default binding', 'const { a: [globalThis = other] } = source; return globalThis;', null],
  ['rest binding', 'const [first, ...globalThis] = source; return globalThis;', null],
  ['hoisted declaration', 'return globalThis; var globalThis;', null],
  ['lexical TDZ', 'return globalThis; const globalThis = other;', null],
  ['property name', 'const Array = other; return globalThis.Array;', 'MemberExpression'],
  ['computed reference', 'const Array = other; return globalThis[Array];', null],
  ['shorthand reference', 'const globalThis = other; return { globalThis };', null],
  ['control flow', 'const type = typeof Value; if (type) return other; return globalThis;', null],
];
let checked = 0;
for (const adapter of adapters) {
  for (const [name, bodySource, expected] of rows) {
    for (const expression of [`({ get w() { ${ bodySource } } })`, `(class { static get w() { ${ bodySource } } })`]) {
      const program = adapter.parseAndScope(`const container = ${ expression };`);
      const container = unwrapRuntimeExpr(adapter.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'container').node.init);
      const body = adapter.pickPath(program, 'BlockStatement').node;
      const returned = singleReturnBodyExpression(body, { preservesBody: true });
      check(`${ adapter.name }: ${ name }: retained body`, returned?.name ?? returned?.type ?? null, expected);
      check(`${ adapter.name }: ${ name }: replaced body`, singleReturnBodyExpression(body), null);
      for (const [spreadVetoes, wanted] of [[false, expected], [true, null]]) {
        const value = findNamespaceMemberValue(container, 'w', null, {}, ({ node }) => node.name,
          { spreadVetoes });
        check(`${ adapter.name }: ${ name }: retained ${ !spreadVetoes }`, value?.name ?? value?.type ?? null, wanted);
      }
      checked += 4;
      if (container.type === 'ObjectExpression') {
        const [prop] = container.properties;
        const value = objectPropertyReadValue(prop, { preservesBody: true });
        check(`${ adapter.name }: ${ name }: retained getter`, value?.name ?? value?.type ?? null, expected);
        check(`${ adapter.name }: ${ name }: consumed getter`, objectPropertyReadValue(prop), null);
        checked += 2;
      }
    }
  }
}
check('all retained-body rows were checked', checked, adapters.length * rows.length * 10);
for (const adapter of adapters) {
  for (const [body, expected] of [
    ['leaked = this; return globalThis;', null],
    ['leaked = () => this; return globalThis;', null],
    ['mark({ this: 1 }); return globalThis;', 'globalThis'],
  ]) {
    const program = adapter.parseAndScope(`const container = { get w() { ${ body } } };`);
    const { init } = adapter.pickPath(program, 'VariableDeclarator').node;
    const value = objectPropertyReadValue(init.properties[0], { preservesBody: true });
    check(`${ adapter.name }: getter this boundary: ${ body }`, value?.name ?? null, expected);
    checked++;
  }
}
check('the suite keeps its coverage floor', checked >= 176, true);
finish();

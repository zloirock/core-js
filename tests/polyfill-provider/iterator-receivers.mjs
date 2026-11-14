// Symbol value proofs and optional receiver plans share live source boundaries.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { asSymbolRef } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { planProxyReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { planConsumedInitializerCarrier, probedNavProbeKey } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { renderSynthEntryKey } from '../../packages/core-js-polyfill-provider/render.js';
import { markRenderedStoredValue, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, runBoth, finish } = createChecker('iterator-receivers');
for (const [setup, expression, expected] of [
  ['', 'choice ? Symbol : Symbol', true],
  ['', 'choice ? (other ? Symbol : Symbol) : Symbol', true],
  ['', 'choice ? (effect(), Symbol) : Symbol', true],
  ['', 'choice ? Symbol : null', false],
  ['', 'choice ? Symbol : globalThis.window?.Symbol', false],
  ['', 'choice ? Symbol : (globalThis.window?.self).Symbol', false],
  ['const Symbol = {};', 'choice ? Symbol : Symbol', false],
  ['const S = {};', 'choice ? Symbol : S', false],
  ['const w = choice ? globalThis : self;', 'w.Symbol', true],
  ['const w = choice ? globalThis : {};', 'w.Symbol', false],
  ['import G from "@core-js/pure/actual/global-this"; import S from "@core-js/pure/actual/self"; const w = choice ? G : S;', 'w.Symbol', true],
]) runBoth(`symbol/${ expression }/${ setup }`, `${ setup } const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'value');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const node = path.node.init;
  const ctx = { node, path, adapter, scope: path.scope };
  const before = JSON.stringify(node);
  check(`${ label }/proof`, !!asSymbolRef(ctx), expected);
  check(`${ label }/repeated`, !!asSymbolRef(ctx), expected);
  check(`${ label }/replayed key`, !!asSymbolRef({ ...ctx, preserveSourceReads: true }),
    expected || expression === 'choice ? Symbol : (globalThis.window?.self).Symbol');
  check(`${ label }/source identity`, JSON.stringify(node), before);
  adapter.isMutatedStatic = (object, key) => object === 'globalThis' && key === 'Symbol';
  check(`${ label }/user Symbol slot`, asSymbolRef(ctx), null);
});

for (const [expression, planned] of [
  ['globalThis.box.list', true],
  ['globalThis.box?.list', false],
  ['(globalThis.box as any)?.list', false],
  ['globalThis.box!.list', true],
  ['globalThis.box?.list.tail', false],
]) runBoth(`receiver/${ expression }`, `const value = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const node = unwrapRuntimeExpr(path.node.init);
  const before = JSON.stringify(node);
  const plan = planProxyReceiver(node, {
    aliasCtx: { path, scope: path.scope, adapter },
    resolvePure: ({ name }) => name === 'globalThis' ? { entry: 'global-this', hintName: 'globalThis' } : null,
  });
  check(`${ label }/planned`, !!plan, planned);
  check(`${ label }/source identity`, JSON.stringify(node), before);
});

check('iterator helper owns its source throw', probedNavProbeKey({
  probedNav: true, outerProps: [{ kind: 'consumed', extractions: [{ synth: 'symbol-iterator' }] }],
}), null);
checkDeep('static extraction retains its source probe', probedNavProbeKey({ probedNav: true, anchor: 'Array' }), { name: 'Array' });
for (const native of [false, true]) {
  const imports = [];
  const key = renderSynthEntryKey({ wksSpelling: 'iterator' }, {
    resolvePure: () => native ? null : { entry: 'symbol/iterator', hintName: 'iterator' },
    injectImport(entry) { imports.push(entry); return 'iter'; },
  });
  check(`${ native }/computed`, key.computed, true);
  check(`${ native }/key kind`, key.key.type, native ? 'MemberExpression' : 'Identifier');
  checkDeep(`${ native }/imports`, imports, native ? [] : ['symbol/iterator']);
}
runBoth('one iterator dispatch owns its guarded source', 'const value = null == w ? void 0 : self;', (parser, program, label) => {
  const { init } = parser.pickPath(program, 'VariableDeclarator').node;
  const read = { kind: 'instance', collapseLeaf: { localName: 'name' }, symbolPattern: true,
    prop: { value: { type: 'ObjectPattern', properties: [] } } };
  const ctx = { injectorState: null };
  check(`${ label }/user guard stays captured`, planConsumedInitializerCarrier(init, [read], ctx).carrier, 'memo');
  markRenderedStoredValue(init);
  const one = planConsumedInitializerCarrier(init, [read], ctx);
  check(`${ label }/one helper`, one.carrier, 'dispatch');
  check(`${ label }/guard identity`, one.receiver, init);
  check(`${ label }/shared readers`, planConsumedInitializerCarrier(init, [read, read], ctx).carrier, 'guard');
});
finish();

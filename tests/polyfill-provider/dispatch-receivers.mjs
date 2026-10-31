// Static dispatch preparation retains source effects and refuses live guards.
import { prepareStaticReceiver } from '../../packages/core-js-polyfill-provider/detect-usage/guard-preparation.js';
import { handleMemberExpressionNode } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('dispatch-receivers');

function resolvePure({ kind, name, object, key }) {
  if (kind === 'global' && ['Array', 'Number', 'globalThis', 'self'].includes(name)) {
    return { kind: 'global', entry: name, hintName: name };
  }
  return kind === 'property' && object === 'Number' && key === 'MAX_SAFE_INTEGER'
    ? { kind: 'static', entry: 'number/max-safe-integer', hintName: 'max' } : null;
}

for (const [name, expression, entry, effects = [], prelude = ''] of [
  ['constructor', 'Array', 'Array'],
  ['static', 'Number.MAX_SAFE_INTEGER', 'number/max-safe-integer'],
  ['source prefix', '(before(), Number.MAX_SAFE_INTEGER)', 'number/max-safe-integer', ['before']],
  ['object prefix', '(object(), Number).MAX_SAFE_INTEGER', 'number/max-safe-integer', ['object']],
  ['key prefix', "Number[(key(), 'MAX_SAFE_INTEGER')]", 'number/max-safe-integer', ['key']],
  ['nested prefixes', "(before(), (object(), globalThis[(ctor(), 'Number')])[(key(), 'MAX_SAFE_INTEGER')])",
    'number/max-safe-integer', ['before', 'object', 'ctor', 'key']],
  ['realm key keeps its read', "globalThis[(key(), 'self')]", null],
  ['realm under static keeps its read', "globalThis[(key(), 'self')].Number.MAX_SAFE_INTEGER", null],
  ['live optional', 'globalThis.window?.Number.MAX_SAFE_INTEGER', null],
  ['sealed throw', '(globalThis.window?.Number).MAX_SAFE_INTEGER', null],
  ['unknown key', 'Array[key()]', null],
  ['user object', 'user.of', null, [], 'const user = {};'],
  ['shadowed constructor', 'Number.MAX_SAFE_INTEGER', null, [], 'const Number = {};'],
  ['mutable receiver', 'value', null, [], 'let value = Array;'],
  ['missing static', 'Array.unknown', null],
  ['source read can throw', '(missing, Number.MAX_SAFE_INTEGER)', 'number/max-safe-integer', ['missing']],
]) runBoth(name, `${ prelude } const result = ${ expression };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'result');
  const node = path.node.init;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(program.node);
  const imports = [];
  const embedded = [];
  const result = prepareStaticReceiver(node, { scope: path.scope, path, adapter, resolvePure }, {
    injectImport(source) { imports.push(source); return '_pure'; },
    embed(source) { embedded.push(unwrapRuntimeExpr(source)); return source; },
  });
  checkDeep(`${ label }/imports`, imports, entry ? [entry] : []);
  checkDeep(`${ label }/effect order`, embedded.map(source => source.callee?.name ?? source.name), effects);
  check(`${ label }/changed identity`, result !== node, entry !== null);
  check(`${ label }/source preserved`, JSON.stringify(program.node), before);
});

runBoth('a declined consumer keeps its static receiver live',
  "(before(), (object(), globalThis[(ctor(), 'Number')])[(key(), 'MAX_SAFE_INTEGER')]).toString();",
  (parser, program, label) => {
    const path = parser.pickPath(program, 'MemberExpression', item => item.node.property.name === 'toString');
    const receiver = unwrapRuntimeExpr(path.node.object).expressions.at(-1);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const handledObjects = new Set();
    function resolve(meta) {
      return meta.kind === 'global' && meta.name === 'Number' ? null : resolvePure(meta);
    }
    const meta = handleMemberExpressionNode({
      node: path.node, scope: path.scope, path, adapter, handledObjects, suppressProxyGlobals: true,
      resolveMeta: resolve, resolvePure: resolve, isEntryAvailable: () => true, keptProxyHops: new Set(),
    });
    check(`${ label }/consumer`, meta.key, 'toString');
    check(`${ label }/no replacement`, resolve(meta), null);
    check(`${ label }/static value remains visitable`, handledObjects.has(receiver), false);
  });

finish();

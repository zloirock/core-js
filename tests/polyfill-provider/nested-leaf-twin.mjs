import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { planNestedLeafTwin } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('nested-leaf-twin');
function context(parser) {
  return {
    adapter: (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' }),
    resolvePure: () => null,
    resolveGlobalPolyfill: name => name === 'Map' ? { entry: 'map', hintName: 'Map' } : null,
    resolveStaticPolyfill: (name, key) => name === 'Array' && key === 'from' ? { entry: 'array/from', hintName: 'Array$from' } : null,
    isOwnAlias: () => false,
  };
}
function findLeaf(parser, program) {
  return parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => {
    const { value } = path.node;
    return value?.name === 'method' || value?.left?.name === 'method';
  });
}

for (const [name, source, kind, memo = false, placement = null] of [
  ['sole leaf', 'const { data: { at: method } } = source;', null],
  ['two leaves', 'const { data: { at: method, other } } = source;', 'declaration'],
  ['typed root', 'const { data: { at: method, length: slotLength } } = source as { data: number[] };', 'declaration'],
  ['parenthesized typed root', 'const { data: { at: method, length: slotLength } } = (source as { data: number[] });', 'declaration'],
  ['rest stays on leaf', 'const { data: { at: method, ...rest } } = source;', 'declaration'],
  ['effectful sole key', "const { data: { [(effect(), 'at')]: method } } = source;", 'declaration'],
  ['flat is already a twin', 'const { at: method, other } = source;', null],
  ['hop key effect', "const { [(effect(), 'data')]: { at: method, other } } = source;", null],
  ['slot default', 'const { data: { at: method, other } = fallback() } = source;', 'declaration', true],
  ['leaf default', 'const { data: { at: method = fallback(), other } } = source;', 'declaration'],
  ['constructor base', 'const { Map: { name: method, other } } = globalThis;', null],
  ['static base', 'const { Array: { from: { name: method, other } } } = globalThis;', null],
  ['export host', 'export const { data: { at: method, other } } = source;', null],
  ['for init', 'for (let { data: { at: method, other } } = source; condition; ) {}', 'declaration', false, 'forInit'],
  ['bodyless default', 'if (condition) var { data: { at: method, other } = fallback() } = source;', 'declaration', true, 'bodyless'],
  ['leading split', 'const source = box; const { data: { at: method, other }, after } = source;', 'declaration', false, 'before'],
  ['trailing split', 'const source = box; const { before, data: { at: method, other } } = source;', 'declaration', false, 'after'],
  ['middle split refuses', 'const source = box; const { before, data: { at: method, other }, after } = source;', null],
  ['split before later declarator refuses', 'const source = box; const { data: { at: method, other }, after } = source, later = effect();', null],
  ['for init outer sibling refuses', 'for (let { data: { at: method, other }, after } = source; condition; ) {}', null],
  ['assignment', 'let method, other; ({ data: { at: method, other } } = source);', 'assignment'],
  ['assignment leaf default', 'let method, other; ({ data: { at: method = fallback(), other } } = source);', 'assignment'],
  ['assignment slot default refuses', 'let method, other; ({ data: { at: method, other } = fallback() } = source);', null],
  ['assignment rest refuses', 'let method, rest; ({ data: { at: method, ...rest } } = source);', null],
  ['assignment key effect refuses', "let method, other; ({ data: { [(effect(), 'at')]: method, other } } = source);", null],
  ['used assignment refuses', 'let method, other; use(({ data: { at: method, other } } = source));', null],
  ['bodyless assignment refuses', 'let method, other; if (condition) ({ data: { at: method, other } } = source);', null],
  ['literal paired slot', 'let method, other; ({ data: { at: method, other } } = { data: make() });', 'assignment'],
  ['literal prefix', 'let method, other; ({ data: { at: method, other } } = (effect(), { data: make() }));', 'assignment'],
  ['reusable literal stays', 'let method, other; ({ data: { at: method, other } } = { data: stable });', null],
]) runBoth(name, source, (parser, program, label) => {
  const path = findLeaf(parser, program);
  const options = context(parser);
  const input = { path, sourceLeafCount: path.parentPath.node.properties.length };
  const before = JSON.stringify(program.node);
  const plan = planNestedLeafTwin(input, options);
  check(`${ label }/kind`, plan?.kind ?? null, kind);
  if (plan) {
    check(`${ label }/memo`, plan.memo, memo);
    checkDeep(`${ label }/receiver keys`, plan.receiver.keys, plan.walk?.keys ?? []);
    if (name === 'typed root') check(`${ label }/source type retained`, plan.receiver.node.type, 'TSAsExpression');
    const place = plan.split ? plan.split.placeBefore ? 'before' : 'after'
      : plan.host?.forInit ? 'forInit' : plan.host?.bodyless ? 'bodyless' : null;
    check(`${ label }/placement`, place, placement);
    check(`${ label }/source leaf borrowed`, plan.leafPattern.node, path.parentPath.node);
    const again = planNestedLeafTwin(input, options);
    checkDeep(`${ label }/repeat`, { kind: again.kind, receiver: again.receiver, memo: again.memo },
      { kind: plan.kind, receiver: plan.receiver, memo: plan.memo });
  }
  check(`${ label }/query leaves source intact`, JSON.stringify(program.node), before);
});

runBoth('claimed nested hop', 'const { Array: { name: method, prototype: { at } } } = globalThis;', (parser, program, label) => {
  const path = findLeaf(parser, program);
  const input = { path, sourceLeafCount: 2 };
  const options = context(parser);
  check(`${ label }/unclaimed sibling admits twin`, planNestedLeafTwin(input, options)?.kind, 'declaration');
  check(`${ label }/claimed hop keeps its own level`, planNestedLeafTwin(input, {
    ...options, resolvePure: () => ({ entry: 'array/at', hintName: 'at' }),
  }), null);
});

runBoth('consumed source leaf', 'const source = box; const { data: { at: method, other } } = source;', (parser, program, label) => {
  const path = findLeaf(parser, program);
  const sourceLeafCount = path.parentPath.node.properties.length;
  path.parentPath.node.properties.pop();
  const input = { path, sourceLeafCount };
  const options = context(parser);
  const plan = planNestedLeafTwin(input, options);
  check(`${ label }/source admits thinned leaf`, plan?.kind, 'declaration');
  check(`${ label }/earlier read requires memo`, plan?.memo, true);
  check(`${ label }/live count alone loses obligation`, planNestedLeafTwin({ path, sourceLeafCount: 1 }, options), null);
});

for (const [name, source, queued, expected, queried = true] of [
  ['queued capture', 'const { from, data: { at: method, other } } = make();', true, 'capture'],
  ['unshared root', 'const { from, data: { at: method, other } } = make();', false, null],
  ['preceding init', 'const first = effect(), { from, data: { at: method, other } } = make();', true, 'capture'],
  ['following init refuses', 'const { from, data: { at: method, other } } = make(), later = effect();', true, null, false],
]) runBoth(name, source, (parser, program, label) => {
  const path = findLeaf(parser, program);
  let reads = 0;
  const before = JSON.stringify(program.node);
  const plan = planNestedLeafTwin({ path, sourceLeafCount: 2, queuedReceiverRead: () => {
    reads++;
    return queued;
  } }, context(parser));
  check(`${ label }/capture`, plan?.kind ?? null, expected);
  check(`${ label }/queued proof queried`, reads > 0, queried);
  check(`${ label }/capture query preserves source`, JSON.stringify(program.node), before);
});

finish();

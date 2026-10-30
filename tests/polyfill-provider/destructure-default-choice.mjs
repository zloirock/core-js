// Source default and synth choices share one owner across both parser bindings.
import {
  destructureDefaultCarriesReceiver,
  planDestructureInstanceSynth,
  planNestedDefaultHop,
  shouldMirrorNestedDestructureDefault,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { decidedRunningOperandPath, typedNavClaimShape } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { toHint } from '../../packages/core-js-polyfill-provider/resolve-node-type/base.js';
import { identifier } from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-default-choice');

function resolvePure(meta) {
  if (meta.placement === 'static' && meta.object === 'Array' && meta.key === 'from') {
    return { kind: 'static', entry: 'array/from', hintName: 'Array$from' };
  }
  return ['at', 'includes', 'keys', 'name'].includes(meta.key) ? {
    kind: 'instance', entry: `${ meta.object ? `${ meta.object }/` : '' }instance/${ meta.key }`, hintName: meta.key,
  } : null;
}

function context(parser) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
  const resolver = parser.makeResolver({ getDecisionAdapter: () => adapter });
  return { adapter, resolvePure, resolveNodeType: resolver.resolveNodeType, toHint };
}

for (const [name, source, expected] of [
  ['array', 'function read({ at } = [1, 2]) {}', 'array/instance/at'],
  ['string', 'function read({ at } = "ab") {}', 'string/instance/at'],
  ['unknown', 'function read({ at } = unknown) {}', 'instance/at'],
  ['call', 'function read({ at } = getValue()) {}', 'instance/at'],
  ['sequence', 'function read({ at } = (effect(), [1, 2])) {}', 'array/instance/at'],
  ['typed wrapper', 'function read({ at } = ([1, 2] as number[])) {}', 'array/instance/at'],
  ['member', 'function read({ at } = box.value) {}', 'instance/at'],
  ['own property', 'function read({ at } = { at: custom }) {}', null],
  ['rest', 'function read({ at, ...rest } = [1, 2]) {}', null],
  ['optional', 'function read({ at } = box?.value) {}', null],
  ['effectful key', 'function read({ [effect()]: at } = [1, 2]) {}', null],
  ['nested binding', 'function read({ at: { name } } = [1, 2]) {}', null],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property');
  const ctx = context(parser);
  const receiverPath = decidedRunningOperandPath(path.parentPath.parentPath.get('right'), ctx.adapter);
  const options = { ...ctx, path, receiverPath, pureResult: { entry: 'instance/at', hintName: 'at' } };
  const before = JSON.stringify(program.node);
  const result = planDestructureInstanceSynth(options);
  check(`${ label }/entry`, result?.entry ?? null, expected);
  if (result) check(`${ label }/slot`, result.key, 'at');
  checkDeep(`${ label }/repeat`, planDestructureInstanceSynth(options), result);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  check(`${ label }/missing receiver`, planDestructureInstanceSynth({ ...options, receiverPath: null }), null);
});

runBoth('paired minted receiver', 'function read({ at } = imported) {}', (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property');
  const options = { ...context(parser), path, receiverPath: path.parentPath.parentPath.get('right'),
    pureResult: { entry: 'instance/at', hintName: 'at' } };
  check(`${ label }/ordinary identifier can mirror`, planDestructureInstanceSynth(options).entry, 'instance/at');
  check(`${ label }/minted paired slot already supplies the value`, planDestructureInstanceSynth({
    ...options, isOwnPassBinding: name => name === 'imported',
  }), null);
  check(`${ label }/foreign import is not ours`, planDestructureInstanceSynth({
    ...options, isOwnPassBinding: () => false,
  }).entry, 'instance/at');
});

for (const [name, source, expected, substituted = false] of [
  ['static', 'const { from: { name } = fallback } = Array;', 'array/from'],
  ['instance', 'const { at: { name } = fallback } = [1, 2];', 'array/instance/at'],
  ['unknown', 'const { at: { name } = fallback } = unknown;', 'instance/at'],
  ['computed', 'const { ["at"]: { name } = fallback } = [1, 2];', null],
  ['shadowed static', 'function read(Array) { const { from: { name } = fallback } = Array; }', null],
  ['primitive constructor fact', 'const { at: { name } = fallback } = "ab";', 'string/instance/at', true],
  ['nested static', 'const { Array: { from: { name } = fallback } } = globalThis;', 'array/from'],
  ['native constructor', 'const { keys: { name } = fallback } = new Map();', 'map/instance/keys'],
  ['substituted constructor', 'const { keys: { name } = fallback } = new Map();', null, true],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', p => p.node.key.name === 'name');
  const receiverPath = parser.pickPath(program, 'VariableDeclarator').get('init');
  const ctx = { ...context(parser), hasSubstitutedConstructor: () => substituted };
  const options = { chain: [{}], kind: 'instance', entry: 'instance/name', path, receiverPath };
  const before = JSON.stringify(program.node);
  const result = planNestedDefaultHop(options, ctx);
  check(`${ label }/outer entry`, result.pure?.entry ?? null, expected);
  check(`${ label }/live default slot`, result.defaultHost, path.parentPath.parentPath.node);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
  checkDeep(`${ label }/repeat`, planNestedDefaultHop(options, ctx), result);
  checkDeep(`${ label }/static leaf has no live fallback`, planNestedDefaultHop({ ...options, kind: 'static' }, ctx),
    { pure: null, defaultHost: null });
  checkDeep(`${ label }/iterator keeps its existing route`, planNestedDefaultHop({ ...options, entry: 'get-iterator-method' }, ctx),
    { pure: null, defaultHost: null });
  checkDeep(`${ label }/flat path has no hop`, planNestedDefaultHop({ ...options, chain: [] }, ctx), { pure: null, defaultHost: null });
  const replacement = identifier('rewrittenDefault');
  path.parentPath.parentPath.node.right = replacement;
  check(`${ label }/late child rewrite`, result.defaultHost.right, replacement);
});

for (const [name, source, carries, mirror] of [
  ['live literal', 'const { k: { at } = [1, 2] } = {};', false, true],
  ['live call', 'const { k: { at } = make() } = {};', true, true],
  ['named default', 'const { k: { at } = list } = {};', true, false],
  ['dead literal', 'const { k: { at } = [1, 2] } = { k: [3] };', false, true],
  ['empty default', 'const { k: { at } = {} } = {};', false, true],
  ['typed navigation', 'const { k: { at } = [1, 2] } = opaque;', false, false],
  ['static outer', 'const { from: { name } = [1, 2] } = Array;', false, false],
  ['captured assignment', 'let at; consume(({ k: { at } = [1, 2] } = opaque));', false, true],
  ['sibling claims', 'const { k: { at, includes } = [1, 2] } = opaque;', false, true],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', p => ['at', 'name'].includes(p.node.key.name));
  const host = parser.pickPath(program, name === 'captured assignment' ? 'AssignmentExpression' : 'VariableDeclarator');
  const receiverPath = host.get(name === 'captured assignment' ? 'right' : 'init');
  const ctx = context(parser);
  const options = { path, defaultPath: path.parentPath.parentPath, receiverPath, getReceiverPath: () => receiverPath, kind: 'instance' };
  const before = JSON.stringify(program.node);
  check(`${ label }/climb`, destructureDefaultCarriesReceiver(options, ctx), carries);
  // Mirroring is asked only after the climb and sibling normalization; dead pairing is
  // rejected independently by synth admission, even if the route itself remains eligible.
  check(`${ label }/post-normalization mirror`, !!shouldMirrorNestedDestructureDefault(options, ctx), mirror);
  let outerReads = 0;
  check(`${ label }/slot static never belongs to the default`, destructureDefaultCarriesReceiver({
    ...options, slotStatic: true, getReceiverPath() { outerReads++; return receiverPath; },
  }, ctx), false);
  check(`${ label }/unused outer receiver stays lazy`, outerReads, 0);
  check(`${ label }/source unchanged`, JSON.stringify(program.node), before);
});

for (const source of [
  'for (const { k: { at } = make() } of values) {}',
  'for ({ k: { at } = make() } in values) {}',
  'try {} catch ({ k: { at } = make() }) {}',
]) runBoth('host without a direct receiver', source, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', p => p.node.key.name === 'at');
  const ctx = context(parser);
  check(`${ label }/no declarator navigation`, typedNavClaimShape(path, { adapter: ctx.adapter, allowLeafSiblings: true }), null);
  check(`${ label }/default keeps its source receiver`, destructureDefaultCarriesReceiver({
    path, defaultPath: path.parentPath.parentPath, kind: 'instance', getReceiverPath: () => null,
  }, ctx), true);
});

finish();

// Ordinary invocation decisions retain source slots and never allocate or mutate on a query.
import { planMethodCall } from '../../packages/core-js-polyfill-provider/render.js';
import { peelNestedSequenceExpressions, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('method-call');

for (const [name, source, capture, keyed = false] of [
  ['constant receiver', 'const rows = []; rows.at(argument());', null],
  ['adjacent parameter reads', 'function read(rows) { return rows.at(argument()); }', null],
  ['member receiver', 'box.rows.at(argument());', 'lookup'],
  ['allocation identity', '[1].at(argument());', 'lookup'],
  ['sequence tail', 'const rows = []; (before(), rows).at(argument());', null],
  ['nested sequence tail', 'const rows = []; (before(), (again(), rows)).at(argument());', null],
  ['live module binding', "import { rows } from './rows.js'; rows.at(argument());", 'lookup'],
  ['reentrant binding write', 'let rows = []; const writer = () => { rows = []; }; rows.at(argument());', 'lookup'],
  ['key follows constant read', 'const rows = []; rows[(key(), "at")](argument());', null, true],
  ['key follows member capture', 'box.rows[(key(), "at")](argument());', 'before-key', true],
  ['key follows allocation capture', '[1][(key(), "at")](argument());', 'before-key', true],
  ['key can replace receiver', 'let rows = []; rows[(rows = other, "at")](argument());', 'before-key', true],
  ['key after full prefix', 'const rows = []; (before(), rows)[(key(), "at")](argument());', null, true],
  ['parameter frame', 'function read(value = getRows().at(argument())) { return value; }', 'lookup'],
  ['field frame', 'class Box { value = getRows().at(argument()); }', 'lookup'],
  ['deferred generator reader', 'function* read(rows) { yield () => rows.at(argument()); rows = other; }', 'lookup'],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => {
    const property = peelNestedSequenceExpressions(member.node.property).tail;
    return property?.name === 'at' || property?.value === 'at';
  });
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const receiver = path.node.object;
  const { prefix } = peelNestedSequenceExpressions(receiver);
  const keyEffects = keyed ? peelNestedSequenceExpressions(path.node.property).prefix : [];
  const { arguments: args } = path.parentPath.node;
  const ctx = { scope: path.scope, path, adapter };
  const input = { receiver, sideEffects: [...prefix, ...keyEffects], receiverEffectCount: prefix.length, args, ctx };
  const before = JSON.stringify(program.node);
  const first = planMethodCall(input);
  planMethodCall(input); // A speculative caller is allowed to ignore the answer completely.
  const repeated = planMethodCall(input);
  const copiedHarvest = planMethodCall({ ...input, sideEffects: structuredClone(input.sideEffects) });
  check(`${ label } capture`, first.capture, capture);
  check(`${ label } repeated capture`, repeated.capture, capture);
  check(`${ label } source tree unchanged`, JSON.stringify(program.node), before);
  check(`${ label } first receiver identity`, first.firstReceiver === receiver, true);
  check(`${ label } live arguments`, first.args === args, true);
  check(`${ label } read frame`, first.ctx.path === path, true);
  checkDeep(`${ label } receiver effects already owned`, first.prefixEffects, []);
  checkDeep(`${ label } cloned harvest keeps source ownership`, copiedHarvest.prefixEffects, []);
  checkDeep(`${ label } key identities`, first.keyEffects, keyEffects);
  check(`${ label } repeated receiver identity`, repeated.receiver === first.receiver, true);
  check(`${ label } first read before key`, first.firstReadEffects.length > 0, keyed && !capture);
});

// Pending imports and memos have no inserted declaration yet. Only the injector's current
// ownership proves them stable; a source import with the same spelling remains a live binding.
for (const [name, source, own, capture] of [
  ['pending pure import', '_receiver.at(0);', true, null],
  ['prior pure import', "import _receiver from '@core-js/pure/features/array/index.js'; _receiver.at(0);", false, 'lookup'],
  ['shadowed spelling', `import outer from '@core-js/pure/features/array/index.js';
    function read(_receiver) { const write = () => { _receiver = other; }; return _receiver.at(0); }`, false, 'lookup'],
]) runBoth(name, source, (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => member.node.property.name === 'at');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  let allocations = 0;
  const injectorState = {
    isOwnPassGeneratedName: () => false,
    isOwnPassPureBinding: bindingName => own && bindingName === '_receiver',
    getPureImport: () => ({ entry: 'array/index' }),
    generateDeclaredRef() { allocations++; throw new Error('A query must not allocate'); },
    addPureImport() { allocations++; throw new Error('A query must not import'); },
  };
  const input = { receiver: path.node.object, ctx: { scope: path.scope, path, adapter, injectorState } };
  planMethodCall(input);
  check(`${ label } capture`, planMethodCall(input).capture, capture);
  check(`${ label } no allocation`, allocations, 0);
  injectorState.isOwnPassGeneratedName = bindingName => bindingName === '_receiver';
  check(`${ label } pending memo visible immediately`, planMethodCall(input).capture, null);
});

runBoth('prepared lookup owns its capture', 'box.rows.at(argument());', (parser, program, label) => {
  const path = parser.pickPath(program, 'MemberExpression', member => member.node.property.name === 'at');
  const receiver = path.node.object;
  const decision = planMethodCall({ receiver, prepared: true, args: path.parentPath.node.arguments });
  check(`${ label } no second capture`, decision.capture, null);
  check(`${ label } preserves upstream this`, decision.receiver === receiver, true);
  check(`${ label } source read still a member`, unwrapRuntimeExpr(decision.receiver).type, 'MemberExpression');
  check(`${ label } absent effect harvest`, planMethodCall({ receiver, sideEffects: null }).capture, 'lookup');
});

finish();

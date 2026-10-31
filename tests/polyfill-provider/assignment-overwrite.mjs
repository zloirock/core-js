// Overwrites read an already assigned binding or the unexecuted source default.
import { planAssignmentOverwrite } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { identifier, renderAssignmentOverwrite, renderNestedExtractionReceiver } from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('assignment-overwrite');

for (const [name, pattern, right, expected, prunes] of [
  ['retained', '{ [(effect(), "at")]: method = fallback() }', 'rows', 'receiver', false],
  ['retained rest', '{ [(effect(), "at")]: method = fallback(), ...rest }', 'rows', 'receiver', false],
  ['pruned', '{ slot: { at: method = fallback() } }', '{ slot: rows }', 'receiver', true],
  ['plain', '{ slot: { at: method } }', '{ slot: rows }', 'receiver', true],
  ['member target', '{ slot: { at: target.method = fallback() } }', '{ slot: rows }', 'receiver', true],
  ['kept getter', '{ slot: { at: method = fallback(), other } }', 'rows', null, null],
  ['effectful root', '{ [(effect(), "at")]: method = fallback() }', 'getRows()', null, null],
  ['effectful target', '{ slot: { at: target[effect()] = fallback() } }', '{ slot: rows }', null, null],
]) runBoth(name, `let method, other, rest; (${ pattern } = ${ right });`, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => {
    const { value } = item.node;
    return value?.name === 'method' || value?.left?.name === 'method' || value?.left?.type === 'MemberExpression';
  });
  const assignment = parser.pickPath(program, 'AssignmentExpression').node;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = {
    scope: path.scope, path, adapter, isOwnAlias: () => false,
    resolveGlobalPolyfill: () => null, resolveStaticPolyfill: () => null,
  };
  const before = JSON.stringify(program.node);
  for (const pending of [false, true]) {
    const tag = `${ label }/${ pending ? 'pending' : 'rendered' }`;
    const input = { path, assignment, entry: 'instance/at', pending };
    const plan = planAssignmentOverwrite(input, ctx);
    check(`${ tag }/admission`, plan?.kind ?? null, expected);
    checkDeep(`${ tag }/repeat`, planAssignmentOverwrite(input, ctx), plan);
    check(`${ tag }/source unchanged`, JSON.stringify(program.node), before);
    if (!plan) continue;
    check(`${ tag }/prunes`, plan.prunesSlot, prunes);
    check(`${ tag }/target`, plan.target, path.node.value.left ?? path.node.value);
    check(`${ tag }/default`, !!plan.fallback, name !== 'plain');
    const liveRoot = pending && assignment.left === path.parentPath.node;
    check(`${ tag }/live root`, plan.liveReceiver, liveRoot ? assignment : null);
    if (plan.fallback) {
      check(`${ tag }/default slot`, plan.fallback.pattern, prunes ? path.node.value : null);
      check(`${ tag }/retained binding`, plan.fallback.binding, prunes ? null : plan.target.name);
    }
    const originalDefault = path.node.value.right;
    const replacementDefault = identifier('rewrittenDefault');
    if (originalDefault) path.node.value.right = replacementDefault;
    const originalReceiver = assignment.right;
    if (liveRoot) assignment.right = identifier('rewrittenReceiver');
    const reads = [];
    const receiver = renderNestedExtractionReceiver(plan, {
      embed(node) { reads.push(node); return node; },
    });
    check(`${ tag }/one receiver read`, reads.length, 1);
    if (liveRoot) check(`${ tag }/rewritten receiver`, receiver, assignment.right);
    let guard = null;
    const ref = identifier('memo');
    const call = identifier('dispatch');
    const defaults = [];
    const rendered = renderAssignmentOverwrite(plan, {
      call, ref, embed(node) { defaults.push(node); return node; },
      defaultGuard(options) { guard = options; return call; },
    });
    check(`${ tag }/rendered`, rendered, call);
    check(`${ tag }/guard required`, !!guard, !!plan.fallback);
    check(`${ tag }/source default embeddings`, defaults.length, plan.fallback && prunes ? 1 : 0);
    if (guard) {
      if (prunes) check(`${ tag }/fallback read`, guard.defaultValue, replacementDefault);
      else checkDeep(`${ tag }/fresh binding read`, guard.defaultValue, identifier(plan.target.name));
      check(`${ tag }/comment owner`, guard.defaultPattern, prunes ? path.node.value : null);
      check(`${ tag }/inferred name`, guard.defaultName, plan.target.name ?? null);
      check(`${ tag }/independent ref nodes`, guard.assignedRef === guard.reread, false);
      check(`${ tag }/ref is not source`, guard.assignedRef === ref, false);
    }
    if (originalDefault) path.node.value.right = originalDefault;
    assignment.right = originalReceiver;
    check(`${ tag }/restored source`, JSON.stringify(program.node), before);
  }
});

finish();

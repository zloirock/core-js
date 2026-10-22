// Ignoring a probe question must not claim its children. Only accepting the plan may do so,
// while the paths are live; the queued read keeps its original guard and the live child slot.
import { pathOfNode } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { renderClaimProbe } from '../../packages/core-js-polyfill-provider/render.js';
import { adapters, createChecker } from '../polyfill-provider/harness.mjs';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  captureProbePlan,
  planDiscardedInitProbe,
  captureSealedNavProbe,
  planSealedNavProbe,
  renderDiscardedInitProbe,
  probeResidualEffects,
  probeEffectNodes,
} from '../../packages/core-js-unplugin/internals/destructure-helpers.js';

const { check, checkTruthy, finish } = createChecker('unplugin-probe-planning');
const source = 'const value = (globalThis.window?.[([1].at(0), "Array")]).of || {};';
const parser = adapters.find(item => item.name === 'oxc');
const program = parser.parseAndScope(source);
const label = 'ignored sealed read';
{
  const path = parser.pickPath(program, 'VariableDeclarator');
  const adapter = createEstreeAdapter({ method: 'usage-pure' });
  const claims = [];
  const ctx = {
    adapter,
    resolvePure: ({ name }) => name === 'Array' || name === 'globalThis' ? { entry: name, hintName: name } : null,
    claimLive: effects => claims.push(...effects),
  };
  const before = JSON.stringify(path.node.init);
  planSealedNavProbe(path.node.init, path, ctx);
  const question = planSealedNavProbe(path.node.init, path, ctx);
  check(`${ label }/ignored query has no claims`, claims.length, 0);
  check(`${ label }/query leaves source intact`, JSON.stringify(path.node.init), before);
  check(`${ label }/leaf decision`, question?.kind, 'leaf');
  const accepted = captureSealedNavProbe(path.node.init, path, ctx);
  check(`${ label }/acceptance visits only the independent key`, claims.length, 1);
  check(`${ label }/key accepted once`, claims.filter(node => node === accepted.keyEffects[0]).length, 1);
  check(`${ label }/live effect identity`, claims[0], accepted.keyEffects[0]);
  check(`${ label }/effects source survives capture`, accepted.effectsHost, question.effectsHost);
  check(`${ label }/guard root stays pristine for sibling questions`, question.leafPlan.guardObject.object.name, 'globalThis');
  checkTruthy(`${ label }/guard is captured`, accepted.test.source.source !== accepted.leafPlan.guardObject);
  const snapshot = JSON.stringify(accepted.test.source.source);
  accepted.leafPlan.guardObject.object.name = 'changed';
  check(`${ label }/guard survives rewriting`, JSON.stringify(accepted.test.source.source), snapshot);
  check(`${ label }/terminal read stays observable`, accepted.foldLeafOntoBase, false);
}
// A child replacement detaches the original expression. Capture reads its native container
// slot after acceptance; a guard/holder snapshot also survives later source rewrites.
for (const input of [
  'const value = globalThis.window?.[([1].at(0), "Array")];',
  'let stored; const value = ((stored = (prepare(), globalThis.window?.self))?.window).Math;',
]) {
  const tree = parser.parseAndScope(input);
  const at = parser.pickPath(tree, 'VariableDeclarator', path => path.node.id.name === 'value');
  const adapter = createEstreeAdapter({ method: 'usage-pure' });
  let replacements = 0;
  function resolvePure({ name }) {
    return name === 'globalThis' || name === 'self' ? { entry: name, hintName: name } : null;
  }
  const plan = captureProbePlan(planSealedNavProbe(at.node.init, at, { adapter, resolvePure })
    ?? planDiscardedInitProbe(at.node.init, at, { adapter, resolvePure }), at, {
    adapter,
    resolvePure,
    claimLive(nodes, anchor) {
      for (const node of nodes) {
        if (node.type === 'CallExpression') {
          pathOfNode(anchor, node).replaceWith({ type: 'Identifier', name: input.includes('stored') ? 'liveHolder' : 'liveKey' });
          replacements++;
        } else if (input.includes('stored') && node.type !== 'Identifier') {
          pathOfNode(anchor, node).replaceWith({ type: 'Identifier', name: 'liveHolder' });
          replacements++;
        }
      }
    },
  });
  checkTruthy(`${ input }/live replacement reached`, replacements > 0);
  const rendered = renderClaimProbe(plan, { injectImport: name => `_${ name }` });
  const snapshot = JSON.stringify(rendered);
  checkTruthy(`${ input }/render reads current child`, snapshot.includes(input.includes('stored') ? 'liveHolder' : 'liveKey'));
  check(`${ input }/old child left behind`, snapshot.includes('"at"'), false);
  at.node.init = { type: 'Identifier', name: 'later' };
  check(`${ input }/capture survives another rewrite`, JSON.stringify(renderClaimProbe(plan, { injectImport: name => `_${ name }` })), snapshot);
}
// Alias holders retain the natural child traversal; accepting one cannot eagerly rebase its
// enclosing receiver. Drain binds source paths after a child has replaced the stored value.
{
  const input = 'let stored; const value = (before(), (stored = globalThis.window?.self).Array);';
  const tree = parser.parseAndScope(input);
  const at = parser.pickPath(tree, 'VariableDeclarator', path => path.node.id.name === 'value');
  const adapter = createEstreeAdapter({ method: 'usage-pure' });
  function resolvePure({ name }) {
    return name === 'globalThis' || name === 'self' ? { entry: name, hintName: name } : null;
  }
  let claims = 0;
  const ctx = { adapter, resolvePure, injectPureImport: name => `_${ name }`, claimLive: () => { claims++; } };
  const decision = planDiscardedInitProbe(at.node.init, at, ctx);
  const accepted = captureProbePlan(decision, at, ctx);
  check('alias holder stays with natural traversal', claims, 0);
  check('alias holder source stays live', accepted.aliasProbe.object, decision.aliasProbe.object);
  accepted.aliasProbe.object.right = { type: 'Identifier', name: 'liveHolder' };
  const rendered = renderDiscardedInitProbe([{ initProbePlan: accepted, metaPath: at }], ctx);
  const snapshot = JSON.stringify(rendered);
  check('alias prefix survives capture', probeResidualEffects(rendered).length, 1);
  check('alias prefix remains live', probeResidualEffects(rendered)[0].callee.name, 'before');
  checkTruthy('alias drain reads the rewritten child', snapshot.includes('liveHolder'));
  check('alias drain leaves no stale navigation', snapshot.includes('"window"'), false);
  accepted.aliasProbe.object.right = { type: 'Identifier', name: 'later' };
  check('emitted alias read owns its copy', JSON.stringify(rendered), snapshot);
}
// The late sealed fallback has no pre-recorded job plan. Its accepted read still owns
// the source effect order, including native slots replaced before the drain consumes them.
{
  const input = 'const value = (before(), (globalThis.window?.self).Array);';
  const tree = parser.parseAndScope(input);
  const at = parser.pickPath(tree, 'VariableDeclarator');
  const adapter = createEstreeAdapter({ method: 'usage-pure' });
  const ctx = {
    adapter,
    resolvePure: ({ name }) => ['globalThis', 'self'].includes(name) ? { entry: name, hintName: name } : null,
    injectPureImport: name => `_${ name }`,
  };
  const rendered = renderDiscardedInitProbe([{ declarator: at.node, metaPath: at }], ctx);
  checkTruthy('late fallback emits a sealed read', rendered);
  check('late fallback preserves the prefix', probeResidualEffects(rendered)[0]?.callee.name, 'before');
  pathOfNode(at, probeResidualEffects(rendered)[0]).replaceWith({ type: 'Identifier', name: 'livePrefix' });
  check('late fallback reads the current prefix slot', probeResidualEffects(rendered)[0]?.name, 'livePrefix');
  check('late fallback places the prefix before the read', probeEffectNodes(rendered)[1], rendered);
  check('late fallback does not replay the read', probeEffectNodes(rendered).length, 2);
}
finish();

// Ignoring a probe question must not claim its children. Only accepting the plan may do so,
// while the paths are live; the queued read keeps its original guard and the live child slot.
import { adapters, createChecker } from '../polyfill-provider/harness.mjs';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { captureSealedNavProbe, planSealedNavProbe } from '../../packages/core-js-unplugin/internals/destructure-helpers.js';

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
  check(`${ label }/acceptance claims once`, claims.length, 1);
  check(`${ label }/live effect identity`, claims[0], accepted.keyEffects[0]);
  check(`${ label }/effects source survives capture`, accepted.effectsHost, question.effectsHost);
  checkTruthy(`${ label }/guard is captured`, accepted.guardObject !== accepted.leafPlan.guardObject);
  const snapshot = JSON.stringify(accepted.guardObject);
  accepted.leafPlan.guardObject.object.name = 'changed';
  check(`${ label }/guard survives rewriting`, JSON.stringify(accepted.guardObject), snapshot);
  check(`${ label }/terminal read stays observable`, accepted.foldLeafOntoBase, false);
}
finish();

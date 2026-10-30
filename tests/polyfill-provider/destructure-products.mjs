// Receiver roles belong to a rendered product, not to a matching source spelling.
// Prefix application observes the live slot and never visits unrelated calls.
import {
  callExpression,
  cloneNode,
  identifier,
  renderDestructureDispatch,
  renderDestructurePrefix,
  renderInstanceDefaultGuard,
  sequenceExpression,
} from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-products');

for (const source of ['receiver', '(receiver)', 'box.value']) {
  runBoth(source, `const value = ${ source };`, (parser, program, label) => {
    const original = parser.pickPath(program, 'VariableDeclarator').node.init;
    const snapshot = JSON.stringify(original);
    for (const guarded of [false, true]) {
      const name = `${ label }/${ guarded ? 'default' : 'bare' }`;
      const product = {};
      const receiver = cloneNode(original);
      const dispatch = renderDestructureDispatch(identifier('lookup'), receiver, product);
      const decoy = callExpression(identifier('fallback'), [cloneNode(original)]);
      const value = guarded ? renderInstanceDefaultGuard({
        assignedRef: identifier('memo'), call: dispatch, defaultValue: decoy, reread: identifier('memo'),
      }) : dispatch;
      const effect = callExpression(identifier('effect'), []);
      const before = JSON.stringify(value);
      check(`${ name }/empty prefix`, renderDestructurePrefix(value, [], product.receiver), value);
      check(`${ name }/empty prefix leaves product intact`, JSON.stringify(value), before);
      check(`${ name }/producer identifies its call`, product.receiver, dispatch);
      check(`${ name }/prefix keeps value identity`, renderDestructurePrefix(value, [effect], product.receiver), value);
      checkDeep(`${ name }/prefix precedes receiver`, dispatch.arguments[0].expressions, [effect, receiver]);
      check(`${ name }/lookalike is untouched`, JSON.stringify(decoy.arguments[0]), snapshot);
      check(`${ name }/source is untouched`, JSON.stringify(original), snapshot);

      // Moving the value keeps its slot. Replacing the child must not revive the old receiver.
      const moved = sequenceExpression([decoy, value]);
      const replacement = identifier('lateReceiver');
      dispatch.arguments[0] = replacement;
      const next = callExpression(identifier('nextEffect'), []);
      renderDestructurePrefix(moved, [next], product.receiver);
      checkDeep(`${ name }/live moved receiver`, dispatch.arguments[0].expressions, [next, replacement]);
      check(`${ name }/move leaves neighbouring calls intact`, moved.expressions[0], decoy);

      // A fresh render over a cloned receiver gets its own role. No metadata is read from the clone.
      const other = {};
      const twin = renderDestructureDispatch(identifier('lookup'), cloneNode(original), other);
      renderDestructurePrefix(twin, [effect], other.receiver);
      check(`${ name }/independent renders`, other.receiver !== product.receiver, true);
      checkDeep(`${ name }/first render still owns its child`, dispatch.arguments[0].expressions, [next, replacement]);
      const copy = cloneNode(twin);
      const withoutRole = renderDestructurePrefix(copy, [next]);
      checkDeep(`${ name }/a clone has no implicit role`, withoutRole.expressions, [next, copy]);
    }
  });
}

// A call-shaped result with no declared receiver must receive an outer prefix.
const unrelated = callExpression(identifier('user'), [identifier('receiver')]);
const effect = identifier('effect');
checkDeep('absence is explicit', renderDestructurePrefix(unrelated, [effect]).expressions, [effect, unrelated]);
check('absence leaves the argument alone', unrelated.arguments[0].name, 'receiver');
finish();

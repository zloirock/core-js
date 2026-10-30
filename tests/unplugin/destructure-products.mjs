// Deferred values publish a fresh receiver role on every render. Defaults and receivers
// are read after child rewrites, so the role must not point into an earlier result.
import { adapters, createChecker } from '../polyfill-provider/harness.mjs';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import createDestructureDrains from '../../packages/core-js-unplugin/internals/destructure-drain.js';
import { identifier, renderDestructurePrefix } from '../../packages/core-js-polyfill-provider/render.js';

const { check, checkDeep, finish } = createChecker('unplugin-destructure-products');
const parser = adapters.find(item => item.name === 'oxc');

for (const guarded of [false, true]) for (const literalRoute of [false, true]) {
  const label = `${ guarded ? 'default' : 'bare' }/${ literalRoute ? 'literal' : 'navigation' }`;
  const program = parser.parseAndScope(`const { at${ guarded ? ' = fallback(rows)' : '' } } = rows;`);
  const metaPath = parser.pickPath(program, 'Property');
  const prop = metaPath.node;
  const host = parser.pickPath(program, 'VariableDeclarator').node;
  const { buildValue } = createDestructureDrains({
    adapter: createEstreeAdapter({ method: 'usage-pure' }),
    injectPureImport: () => '_at',
    resolveGlobalPolyfill: () => null,
    resolveProxyNavReceiver: () => null,
    injector: { generateDeclaredRef: () => '_ref' },
  });
  const value = buildValue({
    kind: 'instance',
    entry: 'instance/at',
    hintName: 'at',
    receiverNode: host.init,
    prop,
    metaPath,
    literalRoute,
    liveReceiver: () => host.init,
  });
  const first = {};
  const before = value(null, first);
  const snapshot = JSON.stringify(before);
  if (guarded) prop.value.right = identifier('lateDefault');
  host.init = identifier('lateReceiver');
  const second = {};
  const after = value(literalRoute ? null : 'lateReceiver', second);
  check(`${ label }/role points at the lookup`, second.receiver.callee.name, '_at');
  check(`${ label }/receiver is read late`, second.receiver.arguments[0].name, 'lateReceiver');
  check(`${ label }/a second render owns its slot`, first.receiver !== second.receiver, true);
  check(`${ label }/render did not reuse the old value`, JSON.stringify(before), snapshot);
  if (guarded) check(`${ label }/default is read late`, after.consequent.expression.name, 'lateDefault');
  const effect = identifier('effect');
  renderDestructurePrefix(after, [effect], second.receiver);
  checkDeep(
    `${ label }/prefix reaches only the current receiver`,
    second.receiver.arguments[0].expressions.map(node => node.name),
    ['effect', 'lateReceiver'],
  );
  check(`${ label }/prefix leaves the old result intact`, JSON.stringify(before), snapshot);
}
finish();

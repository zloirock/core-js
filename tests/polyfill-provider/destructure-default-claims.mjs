// Unknown source hops do not erase independent receiver defaults in global detection.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { buildDestructureLeafMeta, classifyDestructureLeafHost, destructureHostThroughWrappers } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-default-claims');
for (const [name, pattern, expected] of [
  ['own default', '{ [key]: { groupBy } = Map }', 'Map'],
  ['object default', '{ [key]: { groupBy } = Object }', 'Object'],
  ['outer default', '{ [key]: { C: { groupBy } } = { C: Map } }', 'Map'],
  ['array default', '{ [key]: [{ groupBy } = Map] }', 'Map'],
  ['inner unknown', '{ [key]: { [other]: { groupBy } } = Map }', null],
  ['outer unknown', '{ [key]: { inner: { groupBy } = Map } }', 'Map'],
  ['no default', '{ [key]: { groupBy } }', null],
  ['empty default', '{ [key]: { groupBy } = {} }', null],
]) runBoth(name, `const ${ pattern } = source;`, (parser, program, row) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    item => item.node.key.name === 'groupBy');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-global' });
  const descriptor = classifyDestructureLeafHost({ objectPattern: prop.parentPath });
  const meta = buildDestructureLeafMeta({ descriptor, key: 'groupBy', adapter });
  check(`${ row }/default receiver`, meta?.object ?? null, expected);
  check(`${ row }/unknown source stays unpaired`, destructureHostThroughWrappers(prop.parentPath, adapter, true).hops, null);
  const defaults = destructureHostThroughWrappers(prop.parentPath, adapter, true, true).hops;
  check(`${ row }/independent default path`, !!defaults?.length, !!expected);
  if (name === 'array default') check(`${ row }/array default is its own boundary`, defaults[0].index, 0);
  checkDeep(`${ row }/repeat`, buildDestructureLeafMeta({ descriptor, key: 'groupBy', adapter }), meta);
});
finish();

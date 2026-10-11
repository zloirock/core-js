// A chain of destructures, each off the one before (`const { k: p1 } = p0`), asks every link what the link
// below it holds - through the realm-alias check and through the slot pairing's head normalization. An ask
// must walk each link a bounded number of times: count the binding lookups one ask makes over a chain and
// over one twice as long - a walk that re-walks the lower chain per route doubles per link
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { adapters, createChecker } from './harness.mjs';

const { checkTruthy, finish } = createChecker('destructure-chain-complexity');

function chain(links) {
  const lines = ['const { k: p0 } = config;'];
  for (let i = 1; i <= links; i++) lines.push(`const { k: p${ i } } = p${ i - 1 };`);
  return `${ lines.join('\n') }\np${ links }.items;`;
}

function lookups(parser, method, links) {
  const program = parser.parseAndScope(chain(links));
  const read = parser.collectPaths(program, 'MemberExpression').at(-1);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
  let count = 0;
  for (const key of ['getBinding', 'hasBinding']) {
    const original = adapter[key];
    adapter[key] = function (...args) {
      count++;
      return original.apply(this, args);
    };
  }
  resolveObjectName({ objectNode: read.node.object, scope: read.scope, adapter, path: read });
  return count;
}

for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  const short = lookups(parser, method, 8);
  const long = lookups(parser, method, 16);
  checkTruthy(`${ parser.name }/${ method }/lookup counter control`, short > 0, `${ short } lookups`);
  // twice the links: a walk polynomial in the chain grows by a bounded factor, one doubling per link by 2^8
  checkTruthy(`${ parser.name }/${ method }/lookups stay polynomial in the chain`, long <= short * 16, `${ short } -> ${ long }`);
}

finish();

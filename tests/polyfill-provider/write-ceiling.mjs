// A read follows at most 64 writes of one binding (`writesPastCeiling`): a binding written more often is not followed
// through its writes, and an analysis walking them for a read answers as for a value no write settles. Each decision
// is asked of a binding written exactly at the ceiling and of one written once more, through both parsers' bindings:
// a read after every write takes the last of them, and a read before every write is reached by none - or, past the
// ceiling, by any for all the read knows
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  reachingReassignmentValueNode,
  reassignmentReachesUsage,
  writesPastCeiling,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, finish, runBoth } = createChecker('write-ceiling');

const CEILING = 64;

check('a list of 64 writes is within the ceiling', writesPastCeiling(Array.from({ length: CEILING })), false);
check('a list of 65 writes is past it', writesPastCeiling(Array.from({ length: CEILING + 1 })), true);
check('no list is within it', writesPastCeiling(undefined), false);

function writes(count) {
  return Array.from({ length: count }, (unused, index) => `w = [${ index + 1 }];`).join('\n');
}

// the binding of `w` and the path of its read in `w.at(0)`
function bindingAndRead(parser, program) {
  const declarator = parser.pickPath(program, 'VariableDeclarator');
  const read = parser.pickPath(program, 'MemberExpression').get('object');
  return { binding: declarator.scope.getBinding('w'), read };
}

for (const count of [CEILING, CEILING + 1]) {
  const past = count > CEILING;
  runBoth(`a read after ${ count } writes`, `let w = [0];\n${ writes(count) }\nw.at(0);`, (parser, program, label) => {
    const { binding, read } = bindingAndRead(parser, program);
    const value = reachingReassignmentValueNode({ binding, usagePath: read });
    check(`${ label }/the reaching value`, value?.elements?.[0]?.value ?? null, past ? null : count);
  });
  runBoth(`a read before ${ count } writes`, `let w = [0];\nw.at(0);\n${ writes(count) }`, (parser, program, label) => {
    const { binding, read } = bindingAndRead(parser, program);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    check(`${ label }/a write may reach it`, reassignmentReachesUsage({ binding, adapter, path: read }), past);
  });
}

finish();

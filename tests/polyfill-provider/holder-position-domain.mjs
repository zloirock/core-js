// Unit tests for the COMPLETENESS of the escape analysis' position domain. the two walks decide what
// a tracked object can reach by looking at the position it sits in, and both are hand-written case
// lists - the failure mode that list has is silent: a position nobody thought about falls through to
// the default and nobody notices. the equivalence suite next door checks the verdicts it was told to
// check; this one checks that the list of positions is the whole list. the domain is taken from the
// fixture corpus rather than from a parser's node table: it is what this project's syntax surface
// actually contains, and it grows exactly when a fixture introduces a shape nobody has classified
/* eslint-disable node/no-sync -- a one-shot corpus scan at test time: the async forms would buy
   nothing here and babel's parse / traverse are sync anyway */
import { createRequire } from 'node:module';
import { createChecker } from './harness.mjs';
import { LITERAL, POSITIONS } from './holder-shape-equivalence.mjs';

const { parseSync, traverse } = createRequire(import.meta.url)('@babel/core');
const { join, relative, resolve } = path;

const { checkTruthy, finish } = createChecker('holder-position-domain');

// every position an object literal can occupy, with the verdict the analyses owe it:
//   consumes  - evaluated here and unreachable afterwards, so the field narrow stands
//   forwards  - the value flows ON from here, and the position it lands in decides
//   hands-out - a reference (or a copy of the own properties) reaches code the scan cannot see
//   inspects  - the callee is known and only reads the value, which the slot table decides per callee
// a position missing from this table is the finding: it means the walks answer for it by default,
// with nobody having said what the right answer is
const DOMAIN = new Map(Object.entries({
  'ArrayExpression.elements': 'forwards',
  'ArrowFunctionExpression.body': 'hands-out',
  'AssignmentExpression.right': 'forwards',
  'AssignmentPattern.right': 'forwards',
  'BinaryExpression.left': 'consumes',
  'BinaryExpression.right': 'consumes',
  'CallExpression.arguments': 'inspects',
  'ClassPrivateProperty.value': 'hands-out',
  'ClassProperty.value': 'hands-out',
  'ConditionalExpression.alternate': 'forwards',
  'ConditionalExpression.consequent': 'forwards',
  'ConditionalExpression.test': 'consumes',
  'ExportDefaultDeclaration.declaration': 'hands-out',
  'ExpressionStatement.expression': 'consumes',
  'ForInStatement.right': 'consumes',
  'ForOfStatement.right': 'consumes',
  'ForStatement.init': 'consumes',
  'ImportExpression.options': 'hands-out',
  'JSXExpressionContainer.expression': 'hands-out',
  'JSXSpreadAttribute.argument': 'hands-out',
  'JSXSpreadChild.expression': 'hands-out',
  'LogicalExpression.left': 'forwards',
  'LogicalExpression.right': 'forwards',
  'MemberExpression.object': 'consumes',
  'NewExpression.arguments': 'inspects',
  'ObjectProperty.value': 'forwards',
  'OptionalCallExpression.arguments': 'inspects',
  'OptionalMemberExpression.object': 'consumes',
  'ReturnStatement.argument': 'hands-out',
  'SequenceExpression.expressions': 'forwards',
  'SpreadElement.argument': 'hands-out',
  'SwitchCase.test': 'consumes',
  'SwitchStatement.discriminant': 'consumes',
  'TSAsExpression.expression': 'forwards',
  'TSSatisfiesExpression.expression': 'forwards',
  'TemplateLiteral.expressions': 'consumes',
  'ThrowStatement.argument': 'hands-out',
  'UnaryExpression.argument': 'consumes',
  'UpdateExpression.argument': 'consumes',
  'VariableDeclarator.init': 'forwards',
  'YieldExpression.argument': 'hands-out',
}));

// what the plugin actually gets handed in this repo: the shared fixture inputs and the end-to-end
// sources it transforms for the runtime legs. a corpus of code nobody transpiles would widen the
// domain with positions the analyses never see
const CORPUS = [
  { root: resolve('../transpiler-fixtures'), takes: name => name === 'input.mjs' },
  { root: resolve('../e2e-usage-pure'), takes: name => name.endsWith('.js') },
];
const PARSER_PLUGINS = ['jsx', 'typescript', 'decorators'];

function collectPositions(dir, takes, found) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectPositions(file, takes, found);
      continue;
    }
    if (!takes(entry.name)) continue;
    let ast;
    // a fixture that pins syntax this parser build cannot read carries no position information -
    // skipping it under-reports the domain, which is the safe direction for a completeness check
    try {
      ast = parseSync(fs.readFileSync(file, 'utf8'), {
        configFile: false,
        babelrc: false,
        filename: file,
        sourceType: 'unambiguous',
        parserOpts: { plugins: PARSER_PLUGINS },
      });
    } catch {
      continue;
    }
    traverse(ast, {
      ObjectExpression(path) {
        found.set(`${ path.parent.type }.${ path.parentKey }`, file);
      },
    });
  }
  return found;
}

const found = new Map();
for (const { root, takes } of CORPUS) collectPositions(root, takes, found);
// a corpus that suddenly yields almost nothing means the walk stopped finding fixtures, not that the
// domain shrank - without this the whole suite would pass vacuously
checkTruthy('the fixture corpus yields a position domain', found.size >= 25,
  `expected at least 25 object-literal positions, found ${ found.size }`);

for (const [position, file] of [...found].sort()) {
  checkTruthy(`${ position } is classified`, DOMAIN.has(position),
    `unclassified position, first seen in ${ relative(resolve('..'), file) }`
    + ' - decide it and add it to DOMAIN as consumes | forwards | hands-out | inspects');
}

// the domain being written down is only half of it: a position nobody exercises is classified on
// paper only. derive what the equivalence suite actually covers from its own shapes - a hand-kept
// column would drift from the shapes it claims to describe
const covered = new Set();
for (const [, shape] of POSITIONS) {
  let ast;
  try {
    ast = parseSync(shape.replace('@', LITERAL), {
      configFile: false,
      babelrc: false,
      filename: 'shape.jsx',
      sourceType: 'module',
      parserOpts: { plugins: PARSER_PLUGINS },
    });
  } catch {
    continue;
  }
  traverse(ast, {
    ObjectExpression(path) {
      covered.add(`${ path.parent.type }.${ path.parentKey }`);
    },
  });
}
for (const position of found.keys().toArray().sort()) {
  checkTruthy(`${ position } is exercised`, covered.has(position),
    'the corpus puts an object literal here but no equivalence row does - add a row for it');
}

finish();

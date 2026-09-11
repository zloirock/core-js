// Unit tests for the late-CJS diagnostic in `post()`. It answers one question - did a sibling
// rewrite the body to CommonJS after our last flush and leave polyfill imports of OURS behind in
// ESM - and only a full transform beside such a sibling can put that state on the tree, which the
// fixtures (core-js in isolation) cannot express. The two directions are the point: a rewriter that
// reaches our imports too produces a uniform file and owes nothing, while one that misses them
// produces a file that is `import` and `module.exports` at once.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default)
// and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');

const { checkTruthy, finish } = createChecker('late-cjs-diagnostic');

const WARNING = 'a sibling plugin rewrote the file body';

// a rewriter that turns the SOURCE's own module shape into CommonJS at `Program.exit` and leaves
// every other statement alone - the half of a real CJS transform that our imports escape, which is
// how a file ends up mixed. ordered after core-js so it runs on a body our flush already populated
function makePartialCJSRewriter({ types: t }) {
  return {
    visitor: {
      Program: {
        exit(programPath) {
          for (const stmt of programPath.get('body')) {
            if (!stmt.isImportDeclaration() || stmt.node.specifiers.length === 0) continue;
            stmt.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(
              t.identifier(stmt.node.specifiers[0].local.name),
              t.callExpression(t.identifier('require'), [t.stringLiteral(stmt.node.source.value)]),
            )]));
          }
          programPath.pushContainer('body', t.expressionStatement(t.assignmentExpression(
            '=', t.memberExpression(t.identifier('module'), t.identifier('exports')), t.identifier('dep'),
          )));
        },
      },
    },
  };
}

async function transform(code, siblings) {
  const logs = [];
  // the debug channel prints through `console.log`; the diagnostic is one of its lines
  const { log } = console;
  console.log = (...args) => logs.push(args.map(String).join(' '));
  try {
    const { code: out } = await transformAsync(code, {
      configFile: false,
      babelrc: false,
      filename: 'input.mjs',
      sourceType: 'module',
      plugins: [
        ['../../packages/core-js-babel-plugin/index.js', { method: 'usage-global', version: '4.0', targets: { ie: 11 }, debug: true }],
        ...siblings,
      ],
    });
    return { out, warned: logs.join('\n').includes(WARNING) };
  } finally {
    console.log = log;
  }
}

const USAGE = 'import dep from "./dep";\n[1, 2, 3].at(0);\n';

// the sibling reached our import too: uniform CommonJS, nothing owed. this is the row the old
// gate fired on, because it asked whether ANY ESM marker was left and our own were gone with them
{
  const { out, warned } = await transform(USAGE, ['@babel/plugin-transform-modules-commonjs']);
  checkTruthy('late-cjs/uniform rewrite emits no import', !out.includes('import '));
  checkTruthy('late-cjs/uniform rewrite is silent', !warned);
}

// the sibling missed our import: the file is `import` and `module.exports` at once. this is the row
// the old gate stayed silent on, because our surviving import answered "markers are still here"
{
  const { out, warned } = await transform(USAGE, [makePartialCJSRewriter]);
  checkTruthy('late-cjs/partial rewrite leaves our import', out.includes('import "core-js/modules/es.array.at"'));
  checkTruthy('late-cjs/partial rewrite leaves the body CommonJS', out.includes('module.exports'));
  checkTruthy('late-cjs/partial rewrite warns', warned);
}

// no sibling at all: the file is what we emitted into, and there is nothing to report
{
  const { warned } = await transform(USAGE, []);
  checkTruthy('late-cjs/clean ESM is silent', !warned);
}

// a SOURCE the author mixed is a different question with a different owner - the format census
// reads it off the body before any emission, and this gate must not answer for it
{
  const { warned } = await transform('import dep from "./dep";\n[1, 2, 3].at(0);\nmodule.exports = dep;\n', []);
  checkTruthy('late-cjs/author-mixed source is not this gate', !warned);
}

finish();

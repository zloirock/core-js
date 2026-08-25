// A co-transform that runs BEFORE this plugin mints nodes with NO source positions
// (`t.assignmentExpression(...)` carries no start/end - the babel-ecosystem norm). The
// shared plan's span guards must treat an unknown span as IN-SLOT (bias-safe = keep): the
// strict `undefined >= X` comparison silently dropped the rescue, and the user's own WRITE
// vanished from the program. The unplugin leg has no such channel - oxc parses fresh text,
// so a spanless node cannot reach its detect - which is why this lock is babel-only.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const t = requireBabel('@babel/types');
const traverseModule = requireBabel('@babel/traverse');
import { createChecker } from '../polyfill-provider/harness.mjs';

const traverse = traverseModule.default ?? traverseModule;
const { check, finish } = createChecker('spanless-co-transform');

const PLUGIN = new URL('../../packages/core-js-babel-plugin/index.js', import.meta.url).pathname;
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };

// wraps every Identifier declarator init through `wrap` in the co-plugin's own pre() -
// BEFORE this plugin's pre-pass, so the minted spanless node is what the detect sees
function coPlugin(wrap) {
  return { pre(file) {
    traverse(file.ast, { VariableDeclarator(path) {
      if (path.node.init?.type === 'Identifier' && !path.node.coWrapped) {
        path.node.coWrapped = true;
        path.node.init = wrap(path.node.init);
      }
    } });
  } };
}

async function transformed(source, wrap) {
  return (await transformAsync(source, { configFile: false, plugins: [coPlugin(wrap), [PLUGIN, OPTIONS]] })).code;
}

// a spanless chain-assignment in a DISCARDED init: the write rides the discard rescue
const viaWrite = await transformed('let w;\nconst { Array: { from } } = globalThis;\nexport { from, w };',
  init => t.assignmentExpression('=', t.identifier('w'), init));
check('spanless discard rescue keeps the user write', /w = _globalThis/.test(viaWrite), true);

// a spanless SEQUENCE prefix rides the anchor channel - the control that always held
const viaPrefix = await transformed('const { Array: { from } } = globalThis;\nexport { from };',
  init => t.sequenceExpression([t.callExpression(t.identifier('mkSe'), []), init]));
check('spanless sequence prefix keeps its effect', viaPrefix.includes('mkSe()'), true);

// a co-transform that DEMOTES the directive prologue into raw statements (no `.directive` marker
// on either shape - the form `isImportRegion` documents as coming from another transform). the ref
// migration must still land BELOW it: `var _ref;` above `"use client"` kills the directive, and
// the marker-based classifier alone could not see one here
function directiveDemotingPlugin() {
  return { pre(file) {
    const { program } = file.ast;
    const directives = program.directives ?? [];
    if (!directives.length) return;
    program.directives = [];
    program.body.unshift(...directives.map(d => t.expressionStatement(t.stringLiteral(d.value.value))));
  } };
}

const demoted = (await transformAsync('"use client";\nexport const r = globalThis.Array?.prototype.flat.call([1]);\n', {
  configFile: false, plugins: [directiveDemotingPlugin, [PLUGIN, OPTIONS]],
})).code;
const firstStatement = demoted.split('\n').map(line => line.trim()).find(Boolean);
check('demoted directive keeps the first slot', firstStatement, '"use client";');
check('the ref var still migrates below the imports', /import [^\n]*\n(?:import [^\n]*\n)*var _ref;/.test(demoted), true);

finish();

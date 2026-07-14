// Unit tests for `@core-js/babel-plugin/internals/detect-usage.js` path re-anchoring: the
// per-node memo must survive repeated lookups, but a LATER mutation can re-target the stored
// path (replaceWith swaps its node) or detach its ancestor chain (statement removal) - a memo
// hit re-validates both and falls back to a fresh traverse instead of returning the stale path
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as nodePath from 'node:path';
import { createChecker } from '../polyfill-provider/harness.mjs';
import { freshPathOfNode } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ nodePath.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parseAsync, traverse, types: t } = requireBabel('@babel/core');

const { checkTruthy, finish } = createChecker('fresh-path-memo');

async function parseProgram(code) {
  const ast = await parseAsync(code, { configFile: false, babelrc: false });
  let programPath = null;
  traverse(ast, {
    Program(p) {
      programPath = p;
      p.stop();
    },
  });
  return programPath;
}

// live node: lookup finds its path, a repeated lookup reuses it
{
  const programPath = await parseProgram('const a = 1;\nconst b = 2;');
  const [, targetNode] = programPath.node.body;
  const first = freshPathOfNode(programPath, targetNode);
  checkTruthy('live lookup finds the path', first?.node === targetNode);
  checkTruthy('repeated lookup reuses the memo', freshPathOfNode(programPath, targetNode) === first);
}

// re-targeted arm: replaceWith points the stored path at a DIFFERENT node - the memo hit must
// not hand back a path whose `.node` is no longer the requested one
{
  const programPath = await parseProgram('const a = 1;\nconst b = 2;');
  const [, targetNode] = programPath.node.body;
  const stored = freshPathOfNode(programPath, targetNode);
  stored.replaceWith(t.emptyStatement());
  checkTruthy('re-targeted memo is not returned', freshPathOfNode(programPath, targetNode) === null);
}

// detached arm: removing the host statement leaves the stored path with a dead ancestor chain -
// the memo hit must fall through to a fresh traverse (which no longer finds the node)
{
  const programPath = await parseProgram('const a = 1;\nconst b = 2;');
  const hostPath = freshPathOfNode(programPath, programPath.node.body[1]);
  const [targetNode] = hostPath.node.declarations;
  const stored = freshPathOfNode(programPath, targetNode);
  checkTruthy('declarator lookup finds the path', stored?.node === targetNode);
  hostPath.remove();
  checkTruthy('detached memo is not returned', freshPathOfNode(programPath, targetNode) === null);
}

finish();

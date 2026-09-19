// Independent output invariant: a runtime reference to a backed proxy global must be
// substituted or belong to a reviewed exception. Local bindings and erased types do not count.
// Window/global have no pure entry and are intentionally outside this invariant.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { createChecker } from '../polyfill-provider/harness.mjs';

const traverse = _traverse.default ?? _traverse;
const { check, checkDeep, checkTruthy, finish } = createChecker('proxy-global-invariant');
const ROOT = new URL('../transpiler-fixtures/usage-pure/', import.meta.url);
// Counts are exact, including zero: an additional stranded reference cannot hide behind a
// file-wide waiver, and removing an exception requires removing its stale allowance too.
const ALLOWED = new Map([
  // Explicit opt-outs.
  ['audit-anchored-disable-file-negative', ['globalThis']],
  ['audit-disable-next-line-over-a-stored-nav', ['globalThis']],
  ['audit-proxy-hop-normalize-disabled-line', ['globalThis', 'globalThis', 'globalThis']],
  ['opt-out-over-a-guarded-navigation', ['globalThis', 'globalThis']],
  // Targets or exclude make this root unavailable; a different backed hop may still fold.
  ['audit-forced-include-modern-targets', Array(4).fill('globalThis')],
  ['audit-opaque-root-se-key-keeps-its-claim', Array(5).fill('globalThis')],
  ['audit-proxy-host-optional-erases-by-entry', Array(2).fill('globalThis')],
  ['audit-realm-fold-drops-its-guard', Array(3).fill('globalThis')],
  ['audit-realm-run-under-an-excluded-root', Array(2).fill('globalThis')],
  ['excluded-realm-root-guard-stored-carriers', Array(4).fill('globalThis')],
  // Slot writes deopt the original live binding, including compound writes and aliases.
  ['audit-mutated-globalthis-container', ['globalThis']],
  ['audit-mutated-hop-slot-reads', ['self']],
  ['audit-mutated-proxy-root-reads', ['self', 'self']],
  ['audit-mutated-self-copy-mutated-receiver', ['self', 'self']],
  ['audit-nested-proxy-destructure-binding-narrows', Array(4).fill('self')],
  // Babel's scope tracker does not register these TS runtime bindings before lowering.
  ['audit-logical-assign-namespace-shadow-silent', ['globalThis', 'globalThis']],
  ['audit-parameter-property-shadows-proxy-global', ['globalThis', 'globalThis']],
  ['audit-static-block-enum-shadows-realm-alias', ['globalThis', 'globalThis']],
]);

function references(source) {
  let ast;
  for (const dialect of [['typescript'], ['typescript', 'jsx'], ['flow', 'jsx']]) {
    try {
      ast = parse(source, {
        sourceType: 'unambiguous', allowReturnOutsideFunction: true,
        plugins: [...dialect, 'decorators-legacy', 'decoratorAutoAccessors'],
      });
      break;
    } catch { /* Try the other admitted fixture dialect. */ }
  }
  if (!ast) throw new Error('Output cannot be parsed by the invariant oracle');
  const found = [];
  traverse(ast, {
    ReferencedIdentifier(p) {
      if ((p.node.name === 'globalThis' || p.node.name === 'self')
        && !p.scope.getBinding(p.node.name) && !p.findParent(parent => parent.isTSType() || parent.isFlow())) {
        found.push(p.node.name);
      }
    },
  });
  return found;
}

checkDeep('positive: every unbound runtime read is visible', references('consume(globalThis, self);'), ['globalThis', 'self']);
checkDeep('negative: locals, member names and strings', references('function f(globalThis, self) { return globalThis.self + self; } const x = "self";'), []);
checkDeep('negative: erased TS type query', references('type T = typeof globalThis;'), []);
checkDeep('unbacked environment names', references('consume(window, global);'), []);

let checked = 0;
const seen = new Set();
for (const directory of await readdir(ROOT)) {
  for (const filename of ['output.mjs', 'output-unplugin.mjs']) {
    let source;
    try { source = await readFile(new URL(join(directory, filename), ROOT), 'utf8'); } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') continue;
      throw error;
    }
    // Fast admission only: no backed spelling in the bytes means no such identifier in the AST.
    if (!/\b(?:globalThis|self)\b/.test(source)) continue;
    let actual;
    try { actual = references(source); } catch (error) {
      check(`${ directory }/${ filename }/parse`, error.message, 'parseable');
      continue;
    }
    checked++;
    seen.add(directory);
    checkDeep(`${ directory }/${ filename }`, actual, ALLOWED.get(directory) ?? []);
  }
}
checkTruthy('nonempty proxy-bearing corpus', checked > 500);
for (const directory of ALLOWED.keys()) check(`${ directory }/allowance exercised`, seen.has(directory), true);
finish();

import { traverse } from 'estree-toolkit';
import {
  extractIndirectRequireSEPrefix,
  peelSequenceTail,
  programPrologueEndIndex,
  unwrapRuntimeExpr,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import { expressionStatement, renderInjectedImportNodes } from '@core-js/polyfill-provider/render';

// Bind only removed entry statements carrying a comma prefix before body surgery. Plain entry
// imports and direct requires need no scoped walk; decisions about observable reads stay shared.
export function extractEntrySideEffectPrefixes(program, removed, adapter, programPath = null) {
  const candidates = new Set([...removed].filter(node => {
    const expression = unwrapRuntimeExpr(node.expression);
    const call = peelSequenceTail(expression, { step: unwrapRuntimeExpr });
    return expression?.type === 'SequenceExpression'
      || unwrapRuntimeExpr(call?.callee)?.type === 'SequenceExpression';
  }));
  const prefixes = new Map();
  if (!candidates.size) return prefixes;
  function collect(path) {
    if (!candidates.has(path.node)) return;
    prefixes.set(path.node, extractIndirectRequireSEPrefix(path.node, { scope: path.scope, adapter, path }));
  }
  // The usage pre-pass still owns an intact tree here. All removed entries are body
  // statements, so their existing paths need neither another walk nor another scope crawl.
  if (programPath) {
    for (const path of programPath.get('body')) collect(path);
  } else traverse(program, { $: { scope: true }, ExpressionStatement: collect });
  return prefixes;
}

// anchored after the CURRENT prologue's end as a body INDEX
export function injectImportStatements({ program, modules, importStyle, pkg, absoluteImports }) {
  const prologueEnd = programPrologueEndIndex(program.body);
  const nodes = renderInjectedImportNodes({
    globalModules: modules,
    pureEntries: [],
    importStyle,
    resolve: subpath => resolveImportPath(pkg, subpath, absoluteImports),
  }).map(entry => entry.node);
  program.body.splice(prologueEnd, 0, ...nodes);
}

// the application of the entry plan `planEntries` produced: dispositions become body
// surgery - a removed entry vanishes (its observable indirect-require prefix survives as
// standalone statements), a promotion-hazard slot becomes the `0;` terminator. seam ASI
// needs no machinery here: the printer derives separators from structure
export default function applyEntryProgram({ program, plan, modules, importStyle, pkg, absoluteImports, adapter }) {
  const removed = new Set(plan.toRemove);
  const nooped = new Set(plan.toReplaceWithNoop);
  const prefixes = extractEntrySideEffectPrefixes(program, removed.union(nooped), adapter);
  // the import anchor is computed on the ORIGINAL body: a removal can pull a
  // directive-shaped string up against the prologue, and an anchor computed on the rebuilt
  // body would slide past it - promoting it into a directive, exactly what the disposition
  // policy blocked. spelled as a sentinel node the rebuild loop replaces
  const prologueEnd = programPrologueEndIndex(program.body);
  const body = [];
  const anchor = { type: 'EmptyStatement' };
  for (let idx = 0; idx < program.body.length; idx++) {
    if (idx === prologueEnd) body.push(anchor);
    const node = program.body[idx];
    if (prefixes.get(node)?.length) {
      for (const element of prefixes.get(node)) body.push(expressionStatement(element));
      continue;
    }
    if (nooped.has(node)) {
      body.push(expressionStatement({ type: 'Literal', value: 0, raw: '0' }));
      continue;
    }
    if (!removed.has(node)) body.push(node);
  }
  if (prologueEnd === program.body.length) body.push(anchor);
  const anchorIndex = body.indexOf(anchor);
  const nodes = renderInjectedImportNodes({
    globalModules: modules,
    pureEntries: [],
    importStyle,
    resolve: subpath => resolveImportPath(pkg, subpath, absoluteImports),
  }).map(entry => entry.node);
  body.splice(anchorIndex, 1, ...nodes);
  program.body = body;
}

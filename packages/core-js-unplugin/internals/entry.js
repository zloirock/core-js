import { extractIndirectRequireSEPrefix } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options/inject';
import { isDirectiveStatement } from './plugin-helpers.js';
import { bareImport, bareRequire, expressionStatement } from './builders.js';

// the application of the entry plan `planEntries` produced: dispositions become body
// surgery - a removed entry vanishes (its observable indirect-require prefix survives as
// standalone statements), a promotion-hazard slot becomes the `0;` terminator. seam ASI
// needs no machinery here: the printer derives separators from structure

// the injected side-effect module block, canonically ordered; nodes carry no source span,
// so the printer maps them nowhere
function buildImportNodes({ modules, importStyle, pkg, absoluteImports }) {
  const isRequire = importStyle === 'require';
  return sortByPolyfillOrder(modules).map(moduleName => {
    const path = resolveImportPath(pkg, `modules/${ moduleName }`, absoluteImports);
    return isRequire ? bareRequire(path) : bareImport(path);
  });
}

// anchored after the CURRENT prologue's end as a body INDEX
export function injectImportStatements({ program, modules, importStyle, pkg, absoluteImports }) {
  let prologueEnd = 0;
  while (prologueEnd < program.body.length && isDirectiveStatement(program.body[prologueEnd])) prologueEnd++;
  program.body.splice(prologueEnd, 0, ...buildImportNodes({ modules, importStyle, pkg, absoluteImports }));
}

export default function applyEntryProgram({ program, plan, modules, importStyle, pkg, absoluteImports }) {
  const removed = new Set(plan.toRemove);
  const nooped = new Set(plan.toReplaceWithNoop);
  // the import anchor is computed on the ORIGINAL body: a removal can pull a
  // directive-shaped string up against the prologue, and an anchor computed on the rebuilt
  // body would slide past it - promoting it into a directive, exactly what the disposition
  // policy blocked. spelled as a sentinel node the rebuild loop replaces
  let prologueEnd = 0;
  while (prologueEnd < program.body.length && isDirectiveStatement(program.body[prologueEnd])) prologueEnd++;
  const body = [];
  const anchor = { type: 'EmptyStatement' };
  for (let idx = 0; idx < program.body.length; idx++) {
    if (idx === prologueEnd) body.push(anchor);
    const node = program.body[idx];
    if (nooped.has(node)) {
      body.push(expressionStatement({ type: 'Literal', value: 0, raw: '0' }));
      continue;
    }
    if (!removed.has(node)) {
      body.push(node);
      continue;
    }
    for (const element of extractIndirectRequireSEPrefix(node)) body.push(expressionStatement(element));
  }
  if (prologueEnd === program.body.length) body.push(anchor);
  const anchorIndex = body.indexOf(anchor);
  body.splice(anchorIndex, 1, ...buildImportNodes({ modules, importStyle, pkg, absoluteImports }));
  program.body = body;
}

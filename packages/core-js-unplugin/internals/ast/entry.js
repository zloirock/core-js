import { extractIndirectRequireSEPrefix } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { resolveImportPath } from '@core-js/polyfill-provider/helpers/path-normalize';
import { sortByPolyfillOrder } from '@core-js/polyfill-provider/plugin-options/inject';
import { isDirectiveStatement } from '../plugin-helpers.js';

// the AST engine's application of the entry plan `planEntries` produced: the text twin is
// `detectEntries`' rewriter batch. dispositions become body surgery - a removed entry
// vanishes (its observable indirect-require prefix survives as standalone statements), a
// promotion-hazard slot becomes the `0;` terminator - and the whole ASI machinery of the
// text engine has no counterpart here: the printer derives separators from structure

function literal(value) {
  return { type: 'Literal', value, raw: JSON.stringify(value) };
}

function expressionStatement(expression) {
  return { type: 'ExpressionStatement', expression };
}

function bareImport(path) {
  return { type: 'ImportDeclaration', specifiers: [], source: literal(path), attributes: [] };
}

function bareRequire(path) {
  return expressionStatement({
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'require' },
    arguments: [literal(path)],
    optional: false,
  });
}

// injected nodes carry no source span, so the printer maps them nowhere - same contract
// as the text engine's inserted lines
export default function applyEntryProgram({ program, plan, modules, importStyle, pkg, absoluteImports }) {
  const removed = new Set(plan.toRemove);
  const nooped = new Set(plan.toReplaceWithNoop);
  const isRequire = importStyle === 'require';
  const importNodes = sortByPolyfillOrder(modules).map(moduleName => {
    const path = resolveImportPath(pkg, `modules/${ moduleName }`, absoluteImports);
    return isRequire ? bareRequire(path) : bareImport(path);
  });
  // the import anchor is the ORIGINAL prologue's end (a body INDEX - the text engine's
  // `skipDirectivePrologue` answers in offsets): a removal can pull a directive-shaped
  // string up against the prologue, and an anchor computed on the rebuilt body would slide
  // past it - promoting it into a directive, exactly what the disposition policy blocked
  let prologueEnd = 0;
  while (prologueEnd < program.body.length && isDirectiveStatement(program.body[prologueEnd])) prologueEnd++;
  const body = [];
  for (let idx = 0; idx < program.body.length; idx++) {
    if (idx === prologueEnd) body.push(...importNodes);
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
  if (prologueEnd === program.body.length) body.push(...importNodes);
  program.body = body;
}

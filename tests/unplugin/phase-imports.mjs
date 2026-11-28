import {
  buildScopeReassignmentIndex, collectFileCensus, createDeclaredNameIndex, declarationScopeIn, declaratorBindsName,
  extractStaticString, isRequireCall, resolveModuleFormat, unwrapRuntimeExpr, userRequireAt,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

// Every fixture must retain its imports across pre+post. No known phase deltas remain.
export const KNOWN_PHASE_IMPORT_DIFFERENCES = new Map();

// A measured two-pass transform must run both public hooks around its sibling.
export function selectTransformStages(plugins, filename, phase) {
  const stages = plugins.filter(stage => stage.transformInclude(filename));
  if (!stages.length || (phase === 'pre+post'
    && (stages.length !== 2 || stages[0].enforce !== 'pre' || stages[1].enforce !== 'post'))) {
    throw new Error(`Expected ${ phase } stages for ${ filename }, got ${ stages.map(stage => stage.enforce).join(', ') || 'none' }`);
  }
  return stages;
}

// Both passes use one plugin and filename, including when pre abstains or emits empty code.
export function transformPrePost(plugin, source, id) {
  const pre = plugin.transform(source, id, 'pre');
  const code = pre?.code ?? source;
  return plugin.transform(code, id, 'post') ?? pre;
}

// Read syntax rather than lines: comments, multiline imports, dynamic imports and require
// may share a line. String values mentioning an import are not dependencies. Keep the
// package name: a global entry is not interchangeable with its pure counterpart. Absolute
// imports and aliases are valid too, so compare every dependency, including user imports.
function moduleSourceOf(node) {
  switch (node.type) {
    case 'ImportDeclaration':
    case 'ImportExpression':
    case 'ExportNamedDeclaration':
    case 'ExportAllDeclaration': return node.source;
    case 'TSImportEqualsDeclaration': return node.moduleReference?.expression;
    case 'CallExpression':
    case 'OptionalCallExpression':
      if (node.callee?.type === 'Import' || isRequireCall(node)) return unwrapRuntimeExpr(node.arguments[0]);
  }
  return null;
}

// Source nodes belong to genuine loader calls. Both path rewriting and import comparison consume them.
export function moduleSpecifiers(program, id) {
  const found = [];
  const calls = new Map();
  let requireNames = 0;
  function visit(node, insideWith = false) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Identifier' && node.name === 'require') requireNames++;
    const source = moduleSourceOf(node);
    if (source) {
      if (!node.callee || node.callee.type === 'Import') found.push(source);
      else if (!insideWith) calls.set(node, source);
    }
    for (const [key, child] of Object.entries(node)) {
      const scoped = insideWith || (node.type === 'WithStatement' && key === 'body');
      if (Array.isArray(child)) {
        for (const item of child) visit(item, scoped);
      } else if (child?.type) visit(child, scoped);
    }
  }
  visit(program);
  // An extra occurrence can declare or replace the loader. Plain emitted calls need no scope walk.
  if (calls.size && requireNames > calls.size) {
    const declarations = createDeclaredNameIndex(new Set(['require']));
    const scopes = new Map();
    let rootVar = false;
    collectFileCensus(program, [{
      visit(node, frame) {
        // Function-body vars are invisible while parameter defaults run.
        if (frame.parentNode?.kind === 'var' && node.type === 'VariableDeclarator' && declaratorBindsName(node, 'require')) {
          const owner = declarationScopeIn('var', frame.scopes);
          if (owner) declarations.recordName('require', owner.body?.type === 'BlockStatement' ? owner.body : owner);
          else rootVar = true;
        } else declarations.record(node, frame);
        if (calls.has(node)) scopes.set(node, frame.scopes);
      },
      result: () => null,
    }]);
    // A wrapper's own var redeclares the loader; only an actual write replaces it.
    let checkWrites = true;
    if (rootVar) {
      const format = resolveModuleFormat({ program, id, declaredSourceType: program.sourceType });
      if (format.sourceType === 'script') checkWrites = buildScopeReassignmentIndex(program).has('require');
      else declarations.recordName('require', null);
    }
    for (const [call, chain] of scopes) {
      if (declarations.declares('require', chain) || (checkWrites && userRequireAt(call, program))) calls.delete(call);
    }
  }
  for (const source of calls.values()) found.push(source);
  return found;
}

// Sorted dependency identities for the cross-host and differential gates.
export function importSources(program, id) {
  return [...new Set(moduleSpecifiers(program, id).map(source => extractStaticString(source)).filter(value => value !== null))].sort();
}

// Both import-only gates compare the same packages, including their bare entries.
export function coreJSImports(program, id) {
  return importSources(program, id).filter(source => /^(?:core-js|@core-js\/pure)(?:\/|$)/u.test(source));
}

// An exact expected failure is visible debt, not a successful parity check. Removing its
// trigger must remove the record too; widening an exception to a filename-only skip is unsafe.
export function phaseImportVerdict(name, expected, actual, known = KNOWN_PHASE_IMPORT_DIFFERENCES) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const delta = {
    added: [...actualSet].filter(value => !expectedSet.has(value)).sort(),
    missing: [...expectedSet].filter(value => !actualSet.has(value)).sort(),
  };
  const recorded = known.get(name);
  const same = !delta.added.length && !delta.missing.length;
  const status = same ? recorded ? 'stale' : 'passed'
    : recorded && JSON.stringify(recorded) === JSON.stringify(delta) ? 'known' : 'failed';
  return { status, ...delta };
}

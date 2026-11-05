// Every fixture must retain its imports across pre+post. No known phase deltas remain.
export const KNOWN_PHASE_IMPORT_DIFFERENCES = new Map();

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
export function importSources(program) {
  const found = new Set();
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    let source;
    switch (node.type) {
      case 'ImportDeclaration':
      case 'ImportExpression':
      case 'ExportNamedDeclaration':
      case 'ExportAllDeclaration': source = node.source?.value; break;
      case 'TSImportEqualsDeclaration': source = node.moduleReference?.expression?.value; break;
      case 'CallExpression':
        if (node.callee?.type === 'Identifier' && node.callee.name === 'require') source = node.arguments[0]?.value;
        break;
    }
    if (typeof source === 'string') found.add(source);
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child?.type) visit(child);
    }
  }
  visit(program);
  return [...found].sort();
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

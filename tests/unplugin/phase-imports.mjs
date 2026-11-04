// The phase gate records existing import deltas without accepting their runtime behavior.
// Each exact delta must disappear with its fix; a changed delta or a stale entry fails.
// W29 tracks the remaining product repairs separately from this runner.
export const KNOWN_PHASE_IMPORT_DIFFERENCES = new Map([
  ['usage-pure/array-conditional-static-neighbour', { added: ['@core-js/pure/actual/array/of'], missing: [] }],
  ['usage-pure/audit-callroot-proxy-unresolved-sibling-collapse', { added: ['@core-js/pure/actual/function/instance/name'], missing: [] }],
  ['usage-pure/audit-guard-test-keeps-its-ctor-read', { added: ['@core-js/pure/actual/promise'], missing: [] }],
  ['usage-pure/audit-iife-arg-async-iterator-full', { added: ['@core-js/pure/full/array/from'], missing: [] }],
  ['usage-pure/audit-iife-arg-with-existing-default', { added: ['@core-js/pure/actual/array/from'], missing: [] }],
  ['usage-pure/audit-iife-arrow-param-default-arg-wins', { added: ['@core-js/pure/actual/array/from'], missing: [] }],
  ['usage-pure/audit-super-class-proxy-member-dispatch', { added: ['@core-js/pure/actual/map/group-by'], missing: [] }],
  ['usage-pure/audit-symbol-paren-wrapped-receiver-se', { added: ['@core-js/pure/actual/get-iterator'], missing: [] }],
  ['usage-pure/audit-symbol-pattern-value-literal-receiver-object-pattern-computed-default-iterator-next-find-last-name',
    { added: ['@core-js/pure/actual/function/instance/name'], missing: [] }],
  ['usage-pure/audit-symbol-pattern-value-literal-receiver-via-multi-decl', { added: ['@core-js/pure/actual/function/instance/name'], missing: [] }],
  ['usage-pure/audit-type-preserve-iterator-via-entries', { added: ['@core-js/pure/actual/array/instance/filter'], missing: [] }],
  ['usage-pure/captured-constructor-intrinsic-sibling', { added: ['@core-js/pure/actual/map/group-by'], missing: [] }],
  ['usage-pure/computed-member-target-sole-chain-takes-the-ponyfill-where-order-holds', { added: ['@core-js/pure/actual/object/entries'], missing: [] }],
  ['usage-pure/container-slots/array-bound-parameter-shared-instance-key', { added: ['@core-js/pure/actual/instance/at'], missing: [] }],
  ['usage-pure/container-slots/string-bound-parameter-shared-instance-key', { added: ['@core-js/pure/actual/instance/at'], missing: [] }],
  ['usage-pure/dead-hop-default-over-a-literal-beside-a-sibling-keeps-the-leaf-native', { added: ['@core-js/pure/actual/array/instance/flat'], missing: [] }],
  ['usage-pure/hop-default-under-a-guarded-realm-selection-keeps-the-read-native', { added: ['@core-js/pure/actual/number/is-integer'], missing: [] }],
  ['usage-pure/inner-default-proven-dead-through-a-call-extracts', { added: ['@core-js/pure/actual/map/constructor'], missing: [] }],
  ['usage-pure/member-target-wrapped-whole-in-a-ts-assertion-takes-the-ponyfill', { added: ['@core-js/pure/actual/object/entries'], missing: [] }],
  ['usage-pure/prototype-install-absorbed-by-a-guard-render-reads-by-when-the-receiver-is-typed', { added: ['@core-js/pure/actual/instance/at'], missing: [] }],
  ['usage-pure/prototype-installer-open-selection-imported-setter', { added: ['@core-js/pure/actual/instance/at'], missing: [] }],
  ['usage-pure/realm-key-default-beside-claimed-sibling', { added: ['@core-js/pure/actual/array/from'], missing: [] }],
  ['usage-pure/served-static-dead-default-is-no-usage', { added: ['@core-js/pure/actual/array/instance/to-reversed'], missing: [] }],
  ['usage-pure/stored-realm-run-keeps-its-span-acts', { added: ['@core-js/pure/actual/promise/constructor'], missing: [] }],
  ['usage-global/existing-await-import-dedup', { added: [
    'core-js/modules/es.object.to-string', 'core-js/modules/es.promise.catch', 'core-js/modules/es.promise.constructor',
    'core-js/modules/es.promise.finally', 'core-js/modules/es.promise.resolve',
  ], missing: [] }],
]);

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

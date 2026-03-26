// Detect and transform core-js entry imports (entry-global mode)
export default function detectEntries(ast, { getCoreJSEntry, getModulesForEntry, isDisabled, injector, ms }) {
  const { body } = ast;
  const toRemove = [];

  for (const node of body) {
    // import 'core-js/...'
    if (node.type === 'ImportDeclaration' && node.specifiers.length === 0) {
      if (isDisabled(node)) continue;
      const entry = getCoreJSEntry(node.source.value);
      if (entry === null) continue;
      for (const mod of getModulesForEntry(entry)) {
        injector.addGlobalImport(mod);
      }
      toRemove.push(node);
    }

    // require('core-js/...')  as standalone expression statement
    if (node.type === 'ExpressionStatement'
      && node.expression.type === 'CallExpression'
      && node.expression.callee.type === 'Identifier'
      && node.expression.callee.name === 'require'
      && node.expression.arguments.length === 1
      && node.expression.arguments[0].type === 'Literal'
      && typeof node.expression.arguments[0].value === 'string'
    ) {
      if (isDisabled(node)) continue;
      const entry = getCoreJSEntry(node.expression.arguments[0].value);
      if (entry === null) continue;
      for (const mod of getModulesForEntry(entry)) {
        injector.addGlobalImport(mod);
      }
      toRemove.push(node);
    }
  }

  // Remove original imports/requires via magic-string (including trailing newline)
  for (const node of toRemove) {
    let { end } = node;
    if (ms.original[end] === '\n') end++;
    else if (ms.original[end] === '\r' && ms.original[end + 1] === '\n') end += 2;
    ms.remove(node.start, end);
  }
}

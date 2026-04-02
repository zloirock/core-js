// syntax detection rules shared between babel-plugin and unplugin
// each rule receives a raw AST node - no framework-specific APIs
// plugins map these rules to their own visitor protocols
export function createSyntaxRules({ injectModulesForModeEntry, injectModulesForEntry, isDisabled, isWebpack = false }) {
  return {
    onImportExpression(node) {
      if (isDisabled(node)) return;
      injectModulesForModeEntry(isWebpack ? 'promise/all' : 'promise/constructor');
    },
    onFunction(node) {
      if (isDisabled(node)) return;
      if (node.async) {
        injectModulesForModeEntry('promise/constructor');
        if (node.generator) injectModulesForEntry('modules/es.symbol.async-iterator');
      } else if (node.generator) {
        injectModulesForEntry('modules/es.symbol.iterator');
      }
    },
    onForOfStatement(node) {
      if (isDisabled(node)) return;
      injectModulesForModeEntry('symbol/iterator');
      if (node.await) injectModulesForModeEntry('symbol/async-iterator');
    },
    onArrayPattern(node) {
      if (isDisabled(node)) return;
      injectModulesForModeEntry('symbol/iterator');
    },
    onSpreadElement(node, parentType) {
      if (isDisabled(node)) return;
      if (parentType !== 'ObjectExpression') injectModulesForModeEntry('symbol/iterator');
    },
    onYieldExpression(node) {
      if (isDisabled(node)) return;
      if (node.delegate) injectModulesForModeEntry('symbol/iterator');
    },
    onVariableDeclaration(node) {
      if (isDisabled(node)) return;
      if (node.kind === 'using' || node.kind === 'await using') {
        injectModulesForModeEntry('symbol/async-dispose');
        injectModulesForModeEntry('symbol/dispose');
        injectModulesForModeEntry('suppressed-error');
      }
    },
    onClass(node) {
      if (isDisabled(node)) return;
      if (node.decorators?.length || node.body.body.some(el => el.decorators?.length)) {
        injectModulesForModeEntry('symbol/metadata');
      }
    },
  };
}

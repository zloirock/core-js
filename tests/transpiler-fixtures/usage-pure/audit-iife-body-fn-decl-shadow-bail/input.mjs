// singleReturnBodyExpression bails on FunctionDeclaration in the body even when a
// single ReturnStatement is also present. The local `helper` shadow would change
// receiver-name resolution if the return expression were inlined at caller scope.
// Without the bail an inner free-name `helper` would mis-resolve to the inner fn.
const outerArr = [10, 20];
const peeled = (() => {
  function helper() { return 42; }
  return outerArr;
})();
peeled.at(0);

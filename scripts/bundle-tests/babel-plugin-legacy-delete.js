'use strict';
// Firefox 15 rejects `delete f()` in strict mode. A call produces a value, so deleting
// it only evaluates the call and returns true. Run after optional-chain lowering.
module.exports = ({ types }) => ({
  post(file) {
    file.path.traverse({
      UnaryExpression(path) {
        const { operator, argument } = path.node;
        if (operator === 'delete' && types.isCallExpression(argument)) {
          path.replaceWith(types.sequenceExpression([argument, types.booleanLiteral(true)]));
        }
      },
    });
  },
});

// optional-call entry require (`require?.('core-js/...')`); babel models it as an
// OptionalCallExpression (oxc folds the optional marker into a plain CallExpression), so the
// entry source must be read from both call shapes for the scoped entry to expand
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.from");
require("core-js/modules/es.string.iterator");
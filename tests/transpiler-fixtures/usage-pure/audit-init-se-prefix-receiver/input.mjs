// VariableDeclarator init with SE prefix: `(logCall(), Array)` evaluates to Array at runtime,
// SE side-effect of logCall preserved by sequence emission. unwrapInitValue peels tail to Array
const { from } = (logCall(), Array);
from;

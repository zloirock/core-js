// Bare side-effect-only user import without trailing `;`. when injector flushes its
// `var _ref;` after the user import, the emission must terminate the prior import line
// (leading `\n` or implicit terminator). without this, the bundler sees
// `import "y"var _ref;` and bails with SyntaxError on the next parse pass.
import "y"
foo().at?.(-1);

import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// indirect require with an observable side-effect prefix: `(sideEffect(), require)('...')`.
// the SequenceExpression's last element is `require`, so the call still resolves to the
// require binding via the same comma-tail peel as `(0, require)(...)`. the prefix
// expression must survive the entry rewrite -- it has user-visible side effects
function logRequire() {
  return 'logged';
}
logRequire();
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// multiple SE-bearing prefix slots before the require tail. each side-effect must survive
// the entry rewrite in source order; the SequenceExpression tail peel registers the
// entry, and the rewrite emits one ExpressionStatement per preserved prefix slot
function logA() {
  return 'A';
}
function logB() {
  return 'B';
}
logA();
logB();
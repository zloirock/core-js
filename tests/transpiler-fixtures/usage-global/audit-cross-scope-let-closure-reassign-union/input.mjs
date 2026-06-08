// a `let` CONDITIONALLY reassigned in its declaring scope but READ inside a nested closure: when the
// branch is skipped the use still sees the init 'of', when taken it sees 'from', so Array[K] may
// dispatch Array.of OR Array.from - usage-global injects both. estree-toolkit omits the cross-boundary
// reassignment from the binding's constantViolations (babel records it), so the unplugin adapter
// recomputes them by AST scan over the let's scope, keeping the two pipelines aligned. (the
// UNCONDITIONAL counterpart, where the init is provably dead, is covered by the dead-init fixture)
let K = 'of';
if (Date.now() % 2) K = 'from';
const read = () => Array[K]([1, 2, 3]);
read();

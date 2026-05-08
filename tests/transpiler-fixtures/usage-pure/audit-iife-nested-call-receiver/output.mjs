import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";
// nested receiver call: outer arrow returns the inner arrow which returns Promise.
// double-IIFE `(() => () => Promise)()` - the OUTER call's callee is itself an
// arrow whose return body is another ArrowFunctionExpression, NOT a resolvable
// receiver expression. resolveObjectName bottoms out on the inner arrow node and
// fails to classify - so the polyfill emit path bails on the outer .resolve call
const out1 = (() => () => _Promise)().resolve(1);
// single-IIFE pure receiver works as control: confirms the polyfill emits
// without nesting interference and the outer chain stays clean
const out2 = (() => _Promise).call(null).reject(2);
// inline alias whose body invokes another inline alias: receiver is `inner()`,
// not directly an Identifier. resolveObjectName recurses through the inner call
// into its own returned arrow. tail of the chain bottoms out on Promise but
// resolveObjectName only walks ONE inline-call hop - bail expected, native call
const inner = () => _Promise;
const outer = () => inner();
const out3 = _Promise$all([1]);
export { out1, out2, out3 };
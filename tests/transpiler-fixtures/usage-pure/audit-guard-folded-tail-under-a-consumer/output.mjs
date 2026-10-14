import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// a pulled tail ends in a bare ternary, so a consumer that binds tighter - an operator, `await`, a
// ternary test - wraps the whole folded value in parens and the tail rides inside it entire: no step
// is stranded outside, and no `?.` the source never had lands over an intermediate it reads plainly.
// a class field or a sequence element holds the folded value as it is.
const ut = () => _globalThis;
export const unplannedNullishCarrier = (null == ut().window ? void 0 : _self.chrome) ?? 'absent';
const aw = () => _globalThis;
export const awaitedDeepTail = async () => await (null == aw().window ? void 0 : _self.host.probe);
export const awaitedSingleTail = async () => await (null == aw().window ? void 0 : _self.host);
export const carrierDeepTail = (null == aw().window ? void 0 : _self.host.probe) ?? 'absent';
export const operandTail = ((null == aw().window ? void 0 : _self.host.count) ?? 0) + 1;
_globalThis.consumerHost = {
  n: 1,
  list: [1]
};
const cs = () => _globalThis;
export const ternaryTestConsumer = (null == cs().window ? void 0 : _self.consumerHost.n) ? 'y' : 'n';
export const whileConsumer = () => {
  while ((null == cs().window ? void 0 : _self.consumerHost.n) > 100) break;
};
export const sequenceConsumer = (0, null == cs().window ? void 0 : _self.consumerHost.n);
class ConsumerHost {
  static field = null == cs().window ? void 0 : _self.consumerHost.n;
  inst = (() => {
    var _ref, _ref2;
    return null == (_ref = cs()?.window) ? void 0 : _at(_ref2 = _ref.consumerHost.list).call(_ref2, 0);
  })();
}
export const consumerHost = ConsumerHost;
// a pulled tail ends in a bare ternary, so a consumer that binds tighter - an operator, `await`, a
// ternary test - wraps the whole folded value in parens and the tail rides inside it entire: no step
// is stranded outside, and no `?.` the source never had lands over an intermediate it reads plainly.
// a class field or a sequence element holds the folded value as it is.
const ut = () => globalThis;
export const unplannedNullishCarrier = ut()?.window?.self?.chrome ?? 'absent';
const aw = () => globalThis;
export const awaitedDeepTail = async () => await aw()?.window?.self.host.probe;
export const awaitedSingleTail = async () => await aw()?.window?.self.host;
export const carrierDeepTail = aw()?.window?.self.host.probe ?? 'absent';
export const operandTail = (aw()?.window?.self.host.count ?? 0) + 1;
globalThis.consumerHost = { n: 1, list: [1] };
const cs = () => globalThis;
export const ternaryTestConsumer = cs()?.window?.self.consumerHost.n ? 'y' : 'n';
export const whileConsumer = () => { while (cs()?.window?.self.consumerHost.n > 100) break; };
export const sequenceConsumer = (0, cs()?.window?.self.consumerHost.n);
class ConsumerHost {
  static field = cs()?.window?.self.consumerHost.n;
  inst = cs()?.window?.self.consumerHost.list.at(0);
}
export const consumerHost = ConsumerHost;

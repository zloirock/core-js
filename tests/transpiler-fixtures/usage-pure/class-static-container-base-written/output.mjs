// Capturing a class through a container alias does not freeze its static slots.
const ns = {
  Base: class extends Array {}
};
const Base = ns.Base;
ns.Base.from = () => 17;
class Bag extends Base {}
export const result = Bag.from([]);
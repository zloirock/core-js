import _Map from "@core-js/pure/actual/map";
// the base's constructor patches whatever the super() call hands it, and the base names the same
// parameters whether it is spelled bare or read out of a container - so the hopped spelling keeps
// the pairing and the patched static stays native instead of being substituted
const ns = {
  Base: class Base {
    constructor(target) {
      target.groupBy = patch;
    }
  }
};
class Sub extends ns.Base {
  constructor() {
    super(_Map);
  }
}
use(_Map.groupBy);
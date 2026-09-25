import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// an instance claim that dispatches on a receiver CARRIED inside the init's literal (`{ y: nb.y }`)
// performs that read itself: a bodyless slot or a loop head rescues nothing beside the dispatch, so
// the getter runs once
const nb = {
  get y() {
    log();
    return [1, 2];
  }
};
if (c) var viaSlot = _atMaybeArray(nb.y);
do var viaLoop = _flatMaybeArray(nb.y); while (0);
for (var viaHead = _includesMaybeArray(nb.y); !viaHead;) break;
for (let viaLet = _findLastMaybeArray(nb.y), i = 0; i < 1; i++) use(viaLet);
use(viaSlot, viaLoop, viaHead);
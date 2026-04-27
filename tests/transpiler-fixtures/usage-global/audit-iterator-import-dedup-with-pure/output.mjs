import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global mode with a pre-existing `@core-js/pure` import in the source. plugin's
// usage-global path emits side-effect `core-js/modules/...` imports which are independent
// of the pure-package import (different package namespace). no dedup conflict - both
// blocks coexist. covers cross-package import boundary
import _isIterable from '@core-js/pure/actual/is-iterable';
Symbol.iterator in obj;
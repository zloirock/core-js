"use strict";

// SE prefix on indirect require sitting between an existing directive (`"use strict"`)
// and a non-directive string-literal expression. babel's directive-promotion guard would
// fire for this slot (next surviving sibling `"use foo"` would round-trip into the
// prologue), but the SE prefix replacement `spy();` is a non-string statement that
// already breaks the prologue. the prefix MUST win over the `0;` placeholder; otherwise
// `spy()` is silently dropped. `function spy` hoists so the call resolves at top-level
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
spy();
"use foo";
function spy() {
  return 'logged';
}
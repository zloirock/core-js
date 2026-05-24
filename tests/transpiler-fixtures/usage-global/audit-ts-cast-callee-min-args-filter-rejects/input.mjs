// regression repro for `isCallee` TS-wrap peel. JSON.parse with 1 arg uses native (the
// 2-arg `reviver` overload is what the polyfill provides). min-args:2 filter rejects bare
// `JSON.parse(s)` - no polyfill emitted. TS expression wrappers (`as` / `!` / `satisfies`)
// must peel through `isCallee` identity check so the same filter fires for wrapped shapes.
// without the peel (regression), `parent.callee` is the wrapper node and identity-match
// against the inner JSON.parse fails - filter early-returns, polyfill silently over-emits.
// expected output: NO polyfill import (filter symmetrically rejects bare + wrapped 1-arg)
JSON.parse(jsonString);
(JSON.parse as any)(jsonString);
JSON.parse!(jsonString);
(JSON.parse satisfies any)(jsonString);

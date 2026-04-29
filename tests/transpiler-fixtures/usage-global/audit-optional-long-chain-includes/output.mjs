import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
// long optional-chain ending in `.includes(...)`: every link is tracked so the final
// instance-method rewrite uses a single shared guard for the chain.
a?.b?.c?.includes(1);
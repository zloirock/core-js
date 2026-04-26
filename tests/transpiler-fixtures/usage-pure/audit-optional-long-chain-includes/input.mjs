// long optional chain ending in `.includes(...)`: every link is tracked so the final
// instance-method rewrite uses a single shared guard for the chain.
a?.b?.c?.includes(1);

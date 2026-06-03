// proxy-global member as the optional-chain root (`globalThis.list?....`) feeding two composed
// instance methods: the inner `flat()` result memoizes into the outer `includes` receiver, and the
// short-circuit guard captures the root. the guard text must resolve the proxy-global leaf to its
// pure import (`_globalThis.list`), not emit raw `globalThis` (a ReferenceError on engines lacking it)
globalThis.list?.flat().includes(1);

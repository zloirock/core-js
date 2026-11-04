let first, second;
({ Map: first, missing: second } = (observe(first), globalThis.window));
({ missing: second, Map: first } = (observe(first), globalThis.window));
({ left: second, Map: first, right: second } = globalThis.window);
export { first, second };

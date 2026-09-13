// The nested slot reads a method function, not the value its body would return.
// Functions have no built-in keys method, so this pattern adds no instance polyfill.
for (const { w: { keys } } of [{ w() { return Object; } }, { w() { return Object; } }]) keys;

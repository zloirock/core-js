// The pattern anchors on a pure constructor even when its realm root is native.
const { Set: { prototype: { union } } } = globalThis;
export { union };

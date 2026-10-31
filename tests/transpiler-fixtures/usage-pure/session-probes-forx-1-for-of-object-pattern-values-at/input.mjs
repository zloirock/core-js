// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
{
for (const _r of [{ w: Object, y: [1] }]) { let { w: { values }, y: { at } } = _r; [values, at]; }
}

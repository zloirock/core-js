// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions.
{
for (const { w: { entries } } of [{ w: Object }]) { entries = 1; }
}

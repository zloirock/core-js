// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
for (const { w: { values: viaDualBesideInstance }, y: { at: viaInstanceBeside } } of [{ w: Object, y: [1] }]) [viaDualBesideInstance, viaInstanceBeside];

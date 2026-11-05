// A literal-object loop element keeps its native Object.values read.
// Its nested array at leaf still dispatches on the captured array receiver.
for (const { w: { values: viaDualBesideInstance }, y: { at: viaInstanceBeside } } of [{ w: Object, y: [1] }]) [viaDualBesideInstance, viaInstanceBeside];

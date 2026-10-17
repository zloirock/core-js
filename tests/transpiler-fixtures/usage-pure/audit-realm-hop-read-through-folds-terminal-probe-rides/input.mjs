// NEGATIVE: the TERMINAL hop is the value the source reads, so it keeps its slot; the backed
// run below it is what collapses, leaving the probe riding the ponyfill instead of a raw
// realm read off the pure root
export const terminalProbeRides = globalThis.self.window;

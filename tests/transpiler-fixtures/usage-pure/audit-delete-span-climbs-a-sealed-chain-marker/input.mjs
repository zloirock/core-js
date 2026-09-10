// the span a `delete` fold takes runs THROUGH the chain marker: a source seal parks that marker
// mid-navigation, and what stands ABOVE it still decides where the fold lands. stopping at the
// marker takes the shorter span, which reads as "nothing above keeps a guard" and lands the run's
// root binding instead of the hop. the negatives pin the boundary - a seal with no marker under it,
// and a marker with nothing above it, both answer the same either way
globalThis.deleteBox = { slot: 1 };
export const optionalAboveTheSeal = delete (globalThis.self?.window)?.deleteBox;
export const probeHopAboveTheSeal = delete (globalThis.self?.window).window?.deleteBox;
export const noMarkerUnderTheSeal = delete (globalThis.self.window)?.deleteBox;
export const markerWithNothingAbove = delete globalThis.self?.window?.deleteBox;

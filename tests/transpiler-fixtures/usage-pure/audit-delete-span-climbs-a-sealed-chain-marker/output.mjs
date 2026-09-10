import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the span a `delete` fold takes runs THROUGH the chain marker: a source seal parks that marker
// mid-navigation, and what stands ABOVE it still decides where the fold lands. stopping at the
// marker takes the shorter span, which reads as "nothing above keeps a guard" and lands the run's
// root binding instead of the hop. the negatives pin the boundary - a seal with no marker under it,
// and a marker with nothing above it, both answer the same either way
_globalThis.deleteBox = {
  slot: 1
};
export const optionalAboveTheSeal = delete _self.window?.deleteBox;
export const probeHopAboveTheSeal = delete _self.window?.deleteBox;
export const noMarkerUnderTheSeal = delete _self.window?.deleteBox;
export const markerWithNothingAbove = delete _self.window?.deleteBox;
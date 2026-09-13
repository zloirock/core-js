// Plain middle navigation collapses consistently inside and outside parameter default slots.
// A source-written optional window hop retains its probe, while an invented guard must not
// be added to a plain hop. Each form uses separate bindings so reassignment cannot mask this
// navigation decision.
let a1, a2, b1, b2, c1, c2, d1, d2, out;
function eff() {}
function aliasRooted({ trunc } = (a1 = globalThis, a2 = a1.window.self)?.Promise.race.zzz.Math) { return trunc; }
function bareRooted({ trunc } = (b1 = (eff(), globalThis.window.self))?.Promise.noSuchStatic.Math) { return trunc; }
function liveProbe({ trunc } = (c1 = globalThis.window?.self)?.Promise.race.zzz.Math) { return trunc; }
export const outsideTheSlot = (d1 = globalThis, d2 = d1.window.self)?.Promise.race.zzz.Math;
out = [aliasRooted, bareRooted, liveProbe, b2, c2];
export const read = out;

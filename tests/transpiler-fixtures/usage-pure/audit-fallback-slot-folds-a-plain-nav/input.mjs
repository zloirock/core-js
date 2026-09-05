// the caller-correct FALLBACK SLOT stops the probe rule: the slot fires only when nothing was passed,
// so a PLAIN undefinable receiver keeps the always-defined literal instead of an environment probe.
// asked in the shared plan, so both emitters answer one source alike - spelled per render channel they
// disagreed by channel, and by which pass happened to run last.
// each form gets its OWN bindings: a second write to the same alias deopts the follow, and the forms
// would then agree for a reason that has nothing to do with the slot.
// the last two are the negatives - a live `?.` IN the navigation is a branch the source wrote and
// keeps its probe inside the slot too, and the same plain navigation OUTSIDE a slot keeps its probe
let a1, a2, b1, b2, c1, c2, d1, d2, out;
function eff() {}
function aliasRooted({ trunc } = (a1 = globalThis, a2 = a1.window.self)?.Promise.race.zzz.Math) { return trunc; }
function bareRooted({ trunc } = (b1 = (eff(), globalThis.window.self))?.Promise.noSuchStatic.Math) { return trunc; }
function liveProbe({ trunc } = (c1 = globalThis.window?.self)?.Promise.race.zzz.Math) { return trunc; }
export const outsideTheSlot = (d1 = globalThis, d2 = d1.window.self)?.Promise.race.zzz.Math;
out = [aliasRooted, bareRooted, liveProbe, b2, c2];
export const read = out;

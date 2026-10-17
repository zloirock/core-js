// an opt-out comment means "do not touch this line" in EVERY channel, the existing-import sweep
// included: a marked core-js entry is neither adopted as a dedup target nor removed and re-emitted,
// so it stays exactly where the author wrote it. the cost is deliberate and visible here - the
// injector does not know about that module, so its own import lands beside it
// core-js-disable-next-line -- pinned by hand, keep it where it is
import "core-js/modules/es.array.at";
export const pinned = [1].at(0);

// control: the same import WITHOUT the comment is adopted - one import survives, in canonical order
import "core-js/modules/es.array.flat";
export const adopted = [[1]].flat();

// the comment travels with the statement it marks, whatever shape the entry takes
([2].at(0), require)("core-js/modules/es.array.includes"); // core-js-disable-line
export const viaRequire = [3].includes(3);

// a static read through a selection of containers reaches the slot of every arm that may run: both arms
// of an undecided one, the live arm alone of a decided one - spelled in place and under a nested pattern
export const undecidedInPlace = () => (flag ? { C: Map } : { C: Object }).C.groupBy([1], x => x);
export const decidedInPlace = () => (typeof Symbol != 'undefined' ? { C: Iterator } : { C: Array }).C.from([1]);
const { C: { allSettled } } = flag ? { C: Promise } : { C: Object };
export const undecidedPattern = () => allSettled([]);
const { C: { of } } = typeof Symbol != 'undefined' ? { C: Int16Array } : { C: Array };
export const decidedPattern = () => of(1);

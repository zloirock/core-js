import "core-js/modules/es.array.fill";
// a BARE block is itself a statement-list host - descending to its inline first statement would
// return the shorter first-line end and leak the trailing line's module past the directive
// core-js-disable-next-line
{
  use(l.copyWithin(0, 1));
  use(m.findLastIndex(f));
}
export const afterBare = n.fill(0);
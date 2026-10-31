// A claim beside a nested level that claims too reads the one memo of the receiver: a member or call
// root is read once, and every claim dispatches off that read in source order - a defaulted nested
// claim too, its guard reading the dispatch. A nested claim written right after a plain one joins its
// declaration; written first, it binds on its own.
class Store {
  view() {
    const { filter, options: { sort } } = this.state;
    return [filter, sort];
  }
}
const { keys, data: { at } } = holder.page;
const { entries, values, list: { flat } } = load();
const { rows: { includes }, findLast } = holder.page;
const { toSpliced, picked: { findLastIndex = null } } = holder.page;
const { toReversed, sorted: { toSorted = null } } = load();
use(new Store(), keys, at, entries, values, flat, includes, findLast, toSpliced, findLastIndex, toReversed, toSorted);

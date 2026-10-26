// immutable: persistent Map / Set / List / Seq / Record - building, nested updates, lazy sequences,
// iteration, value equality. Expected values follow from the inputs and immutable's documented API.
//
// Its reason is the NAMES axis: the ES build bundled here (`module`) declares its own `Map`, `Set` and
// `Iterator` at module level, over the globals core-js polyfills - 7, 5 and 34 references resolve to
// those locals. A
// provider that took one of them for the built-in would rewrite it in `usage-pure` to core-js's own
// and break the library: with the internal references of any one of the three resolved to the
// built-in instead, the run throws.
import { Map, Set, List, Seq, Record, fromJS, is } from 'immutable';
import { checker } from './checks.mjs';

export function run() {
  const { checks, check } = checker();
  const map = Map({ a: 1, b: 2 }).set('c', 3).delete('a');
  check('map', [map.toJS(), map.size, Map.isMap(map), map.get('b')], [{ b: 2, c: 3 }, 2, true, 2]);
  const set = Set([3, 1, 2, 3]).add(4);
  check('set', [set.toArray().sort(), set.has(4), Set.isSet(set)], [[1, 2, 3, 4], true, true]);
  const list = List([1, 2, 3]).push(4).map(x => x * 2).filter(x => x > 2);
  check('list', [list.toArray(), list.first(), list.last()], [[4, 6, 8], 4, 8]);
  const deep = fromJS({ a: { b: [1, 2, { c: 3 }] } });
  check('deep', [deep.getIn(['a', 'b', 2, 'c']), deep.setIn(['a', 'b', 0], 9).toJS().a.b[0], is(fromJS({ x: [1] }), fromJS({ x: [1] }))],
    [3, 9, true]);
  check('seq', Seq([1, 2, 3, 4, 5]).filter(x => x % 2).map(x => x ** 2).toArray(), [1, 9, 25]);
  const Point = Record({ x: 0, y: 0 });
  const point = new Point({ x: 2 });
  check('record', [point.x, point.y, point.set('y', 5).toJS()], [2, 0, { x: 2, y: 5 }]);
  // iteration goes through the library's own `Iterator`
  const entries = [];
  for (const [key, value] of Map({ q: 1, r: 2 })) entries.push(key + value);
  check('iterate', [entries, [...List([7, 8])], [...Set(['s'])]], [['q1', 'r2'], [7, 8], ['s']]);
  // the global Map beside the library's: a built-in, not immutable's
  check('global_map', [new globalThis.Map([[1, 'one']]).get(1), Map.isMap(new globalThis.Map())], ['one', false]);
  return { checks };
}

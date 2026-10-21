import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
// a selection standing on any level a container literal pairs - an array element, a level deeper down, a
// slot of a container arm, in any spelling the arms split from - hands the pattern under it one arm per run:
// an arm that is a name holding several values stays as written, a static read off it reads the binding
// pure swapped in, and that constructor takes the entry carrying its own statics. a head that may hold null
// keeps a `||` / `??` over it open
for (const M of [_Map, _Set]) {
  const [{
    groupBy
  }] = [c ? M : Object];
  use(groupBy);
}
for (const P of [_Promise, _Set, null]) {
  const {
    A: {
      W: {
        try: attempt
      }
    }
  } = {
    A: {
      W: P ?? Object
    }
  };
  use(attempt);
}
for (const I of [_Iterator, _Set, null]) {
  const {
      W: _ref
    } = c ? {
      W: I || Array
    } : box,
    from = _ref === Array ? _Array$from : _ref.from;
  use(from);
}
for (const S of [_Symbol, _Set]) {
  let cached;
  const {
    W: [{
      for: forKey
    }]
  } = {
    W: [cached ||= S]
  };
  use(forKey);
}
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// a selection a container literal holds in a slot hands the pattern level under that slot one arm per run,
// as the same selection spelled as the source does: an arm that is a name holding several values stays as
// written, a static read off it reads the binding pure swapped in, and that constructor takes the entry
// carrying its own statics - in every pattern host. Set reads no own static and keeps the narrow entry; each
// head may hold null, so its selection stays open
for (const M of [_Map, _Set, null]) {
  const {
    W: {
      groupBy
    }
  } = {
    W: M || Object
  };
  use(groupBy);
}
for (const P of [_Promise, _Set, null]) {
  let attempt;
  ({
    W: {
      try: attempt
    }
  } = {
    W: P || Object
  });
  use(attempt);
}
for (const I of [_Iterator, _Set, null]) {
  (function ({
    W: {
      from
    }
  } = {
    W: I || Array
  }) {
    use(from);
  })();
}
for (const S of [_Symbol, _Set, null]) {
  for (const {
    W: {
      for: forKey
    }
  } of [{
    W: S || Object
  }]) use(forKey);
}
for (const U of [_URL, _Set, null]) {
  try {
    run();
  } catch ({
    E: {
      W: {
        canParse
      }
    } = {
      W: U || Object
    }
  }) {
    use(canParse);
  }
}
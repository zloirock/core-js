import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// an anon object's `this.<field>` flow must NOT narrow once the anon can be held by external
// code: a destructuring TARGET whose binding leaks receives the anon (declarator and assignment
// forms, including a deeper remainder slot and a rest target), an untrackable slot (computed
// key / inline spread) can be extracted by any carrier read, and a member store places the anon
// at the chain's composed slot path, so a held read of that slot aliases it out. targets and
// slots that are only dereferenced keep the narrow
function take(sink, dyn) {
  const [fromArrayPattern] = [{
    data: ['x'],
    read() {
      var _ref;
      return _at(_ref = this.data).call(_ref, 0);
    }
  }];
  sink(fromArrayPattern);
  const {
    x: fromObjectPattern
  } = {
    x: {
      tags: 'xy',
      scan() {
        var _ref2;
        return _includes(_ref2 = this.tags).call(_ref2, 'x');
      }
    }
  };
  sink(fromObjectPattern);
  let reassigned;
  [reassigned] = [{
    nums: [1],
    pick() {
      var _ref3;
      return _at(_ref3 = this.nums).call(_ref3, 1);
    }
  }];
  sink(reassigned);
  const {
    x: holdsCarrier
  } = {
    x: [{
      list: [2],
      has() {
        var _ref4;
        return _includes(_ref4 = this.list).call(_ref4, 2);
      }
    }]
  };
  sink(holdsCarrier[0]);
  let rest;
  [...rest] = [[{
    deep: ['d'],
    grab() {
      var _ref5;
      return _at(_ref5 = this.deep).call(_ref5, 2);
    }
  }]];
  sink(rest[0][0]);
  const keyed = {
    [dyn]: {
      words: 'ab',
      ask() {
        var _ref6;
        return _includes(_ref6 = this.words).call(_ref6, 'a');
      }
    }
  };
  sink(keyed[dyn]);
  const spreadCopy = {
    ...{
      w: {
        chars: ['c'],
        look() {
          var _ref7;
          return _at(_ref7 = this.chars).call(_ref7, 3);
        }
      }
    }
  };
  sink(spreadCopy.w);
  const holder = {};
  holder.f = {
    marks: 'mn',
    test() {
      var _ref8;
      return _includes(_ref8 = this.marks).call(_ref8, 'm');
    }
  };
  sink(holder.f);
  const chained = {
    a: {}
  };
  chained.a.b = {
    bits: [4],
    poke() {
      var _ref9;
      return _at(_ref9 = this.bits).call(_ref9, 4);
    }
  };
  sink(chained.a.b);
}
take(x => x, 'k');
// a field write through the anon's slot path breaks the zero-external-write premise of the
// local narrow, so the anon bails to generic even though it is never held
const written = {
  a: {
    cells: ['w'],
    peek() {
      var _ref10;
      return _at(_ref10 = this.cells).call(_ref10, 7);
    }
  }
};
written.a.cells = 5;
written.a.peek();
const storedWritten = {};
storedWritten.f = {
  codes: 'kw',
  check() {
    var _ref11;
    return _includes(_ref11 = this.codes).call(_ref11, 'k');
  }
};
storedWritten.f.codes = 5;
storedWritten.f.check();
// dereferenced-only targets and slots keep the narrow
const [localPattern] = [{
  data: ['y'],
  read() {
    var _ref12;
    return _atMaybeArray(_ref12 = this.data).call(_ref12, 5);
  }
}];
localPattern.read();
let localAssigned;
[localAssigned] = [{
  tags: 'yz',
  scan() {
    var _ref13;
    return _includesMaybeString(_ref13 = this.tags).call(_ref13, 'y');
  }
}];
localAssigned.scan();
const localHolder = {};
localHolder.f = {
  nums: [6],
  pick() {
    var _ref14;
    return _atMaybeArray(_ref14 = this.nums).call(_ref14, 6);
  }
};
localHolder.f.pick();
const localCarrier = {};
localCarrier.g = [{
  list: [7],
  has() {
    var _ref15;
    return _includesMaybeArray(_ref15 = this.list).call(_ref15, 7);
  }
}];
localCarrier.g[0].has();
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
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
      return this.data.at(0);
    }
  }];
  sink(fromArrayPattern);
  const {
    x: fromObjectPattern
  } = {
    x: {
      tags: 'xy',
      scan() {
        return this.tags.includes('x');
      }
    }
  };
  sink(fromObjectPattern);
  let reassigned;
  [reassigned] = [{
    nums: [1],
    pick() {
      return this.nums.at(1);
    }
  }];
  sink(reassigned);
  const {
    x: holdsCarrier
  } = {
    x: [{
      list: [2],
      has() {
        return this.list.includes(2);
      }
    }]
  };
  sink(holdsCarrier[0]);
  let rest;
  [...rest] = [[{
    deep: ['d'],
    grab() {
      return this.deep.at(2);
    }
  }]];
  sink(rest[0][0]);
  const keyed = {
    [dyn]: {
      words: 'ab',
      ask() {
        return this.words.includes('a');
      }
    }
  };
  sink(keyed[dyn]);
  const spreadCopy = {
    ...{
      w: {
        chars: ['c'],
        look() {
          return this.chars.at(3);
        }
      }
    }
  };
  sink(spreadCopy.w);
  const holder = {};
  holder.f = {
    marks: 'mn',
    test() {
      return this.marks.includes('m');
    }
  };
  sink(holder.f);
  const chained = {
    a: {}
  };
  chained.a.b = {
    bits: [4],
    poke() {
      return this.bits.at(4);
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
      return this.cells.at(7);
    }
  }
};
written.a.cells = 5;
written.a.peek();
const storedWritten = {};
storedWritten.f = {
  codes: 'kw',
  check() {
    return this.codes.includes('k');
  }
};
storedWritten.f.codes = 5;
storedWritten.f.check();
// dereferenced-only targets and slots keep the narrow
const [localPattern] = [{
  data: ['y'],
  read() {
    return this.data.at(5);
  }
}];
localPattern.read();
let localAssigned;
[localAssigned] = [{
  tags: 'yz',
  scan() {
    return this.tags.includes('y');
  }
}];
localAssigned.scan();
const localHolder = {};
localHolder.f = {
  nums: [6],
  pick() {
    return this.nums.at(6);
  }
};
localHolder.f.pick();
const localCarrier = {};
localCarrier.g = [{
  list: [7],
  has() {
    return this.list.includes(7);
  }
}];
localCarrier.g[0].has();
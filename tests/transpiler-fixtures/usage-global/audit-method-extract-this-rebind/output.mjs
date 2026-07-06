import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.json.stringify";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// a HELD read of an own-this method (var / destructure extraction, `.call` chain, object-spread
// copy, class-instance / static / prototype extraction) hands out a function whose `this` rebinds
// at a later invocation - the this-field narrow must bail to the generic helper. a DIRECT call, a
// discarded dynamic read and a function-skipping serializer keep the narrow
const extracted = {
  cells: ['a'],
  peek() {
    return this.cells.at(0);
  }
};
const m1 = extracted.peek;
m1.call({
  cells: 'zz'
});
const plucked = {
  tags: 'ab',
  scan() {
    return this.tags.includes('a');
  }
};
const {
  scan
} = plucked;
scan.call({
  tags: ['q']
});
const copied = {
  nums: [1],
  pick() {
    return this.nums.at(1);
  }
};
const twin = {
  ...copied,
  nums: 'xy'
};
twin.pick();
const called = {
  list: [2],
  has() {
    return this.list.includes(2);
  }
};
called.has.call({
  list: 'pq'
});
class Inst {
  chars = ['c'];
  look() {
    return this.chars.at(2);
  }
}
const inst = new Inst();
const m2 = inst.look;
m2.call({
  chars: 7
});
class Stat {
  static words = 'wv';
  static ask() {
    return this.words.includes('w');
  }
}
const m3 = Stat.ask;
m3.call({
  words: [3]
});
class Proto {
  bits = [4];
  poke() {
    return this.bits.at(4);
  }
}
const m4 = Proto.prototype.poke;
m4.call({
  bits: 'bb'
});
new Proto().poke();
// an identity-returning callee result held = an untracked alias; the PROTO slot of
// setPrototypeOf makes the receiver inherit the methods
const frozen = {
  keys2: ['k'],
  grab() {
    return this.keys2.at(6);
  }
};
const alias = Object.freeze(frozen);
const m5 = alias.grab;
m5.call({
  keys2: 'kk'
});
const inherited = {
  seq: 'st',
  find2() {
    return this.seq.includes('s');
  }
};
const heir = {};
Object.setPrototypeOf(heir, inherited);
heir.find2();
// direct call, discarded dynamic read and function-skipping serialization keep the narrow
const direct = {
  marks: 'mn',
  test() {
    return this.marks.includes('m');
  }
};
direct.test();
function probe(k) {
  const local = {
    data: [5],
    read() {
      return this.data.at(5);
    }
  };
  local[k];
  JSON.stringify(local);
  return local.read();
}
probe('data');
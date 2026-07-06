import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a HELD read of an own-this method (var / destructure extraction, `.call` chain, object-spread
// copy, class-instance / static / prototype extraction) hands out a function whose `this` rebinds
// at a later invocation - the this-field narrow must bail to the generic helper. a DIRECT call, a
// discarded dynamic read and a function-skipping serializer keep the narrow
const extracted = {
  cells: ['a'],
  peek() {
    var _ref;
    return _at(_ref = this.cells).call(_ref, 0);
  }
};
const m1 = extracted.peek;
m1.call({
  cells: 'zz'
});
const plucked = {
  tags: 'ab',
  scan() {
    var _ref2;
    return _includes(_ref2 = this.tags).call(_ref2, 'a');
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
    var _ref3;
    return _at(_ref3 = this.nums).call(_ref3, 1);
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
    var _ref4;
    return _includes(_ref4 = this.list).call(_ref4, 2);
  }
};
called.has.call({
  list: 'pq'
});
class Inst {
  chars = ['c'];
  look() {
    var _ref5;
    return _at(_ref5 = this.chars).call(_ref5, 2);
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
    var _ref6;
    return _includes(_ref6 = this.words).call(_ref6, 'w');
  }
}
const m3 = Stat.ask;
m3.call({
  words: [3]
});
class Proto {
  bits = [4];
  poke() {
    var _ref7;
    return _at(_ref7 = this.bits).call(_ref7, 4);
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
    var _ref8;
    return _at(_ref8 = this.keys2).call(_ref8, 6);
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
    var _ref9;
    return _includes(_ref9 = this.seq).call(_ref9, 's');
  }
};
const heir = {};
Object.setPrototypeOf(heir, inherited);
heir.find2();
// direct call, discarded dynamic read and function-skipping serialization keep the narrow
const direct = {
  marks: 'mn',
  test() {
    var _ref10;
    return _includesMaybeString(_ref10 = this.marks).call(_ref10, 'm');
  }
};
direct.test();
function probe(k) {
  const local = {
    data: [5],
    read() {
      var _ref11;
      return _atMaybeArray(_ref11 = this.data).call(_ref11, 5);
    }
  };
  local[k];
  _JSON$stringify(local);
  return local.read();
}
probe('data');
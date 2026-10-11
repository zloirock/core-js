import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$create from "@core-js/pure/actual/object/create";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$seal from "@core-js/pure/actual/object/seal";
// a static-only key read through a wrapper level off a selecting receiver mirrors the constructor arm in
// place and leaves the user arm as written - an element, an `&&`, behind an effect prefix, an IIFE
// argument, two levels deep, under a key, an index, a hop default, a computed literal key or in a getter's
// returned value; a plain constructor level mirrors the same way, its hop default left dead
const [{
  of: viaElementDefault
} = {}] = [c ? {
  of: _Array$of
} : userObj];
const [{
  from: viaAnd
}] = [c && {
  from: _Array$from
}];
const [{
  trunc: viaPrefix
}] = [(mark++, c ? {
  trunc: _Math$trunc
} : userObj)];
const viaIife = (([{
  fromEntries: fe
}]) => fe)([c ? {
  fromEntries: _Object$fromEntries
} : userObj]);
const [[{
  groupBy: viaDouble
}]] = [[c ? {
  groupBy: _Object$groupBy
} : userObj]];
const [{
  w: {
    sign: viaArrayKeyed
  }
}] = [{
  w: c ? {
    sign: _Math$sign
  } : userObj
}];
const {
  w: {
    assign: viaHopDefault
  } = {}
} = {
  w: c ? {
    assign: _Object$assign
  } : userObj
};
const {
  0: {
    defineProperties: viaIndexKey
  }
} = [c ? {
  defineProperties: _Object$defineProperties
} : userObj];
const {
  ['w']: {
    create: viaComputedHop
  }
} = {
  w: c ? {
    create: _Object$create
  } : userObj
};
const {
  w: {
    seal: viaGetter
  }
} = {
  get w() {
    return c ? {
      seal: _Object$seal
    } : userObj;
  }
};
const {
  w: {
    hasOwn: viaHopDefaultPlain
  } = {}
} = {
  w: {
    hasOwn: _Object$hasOwn
  }
};
export { viaElementDefault, viaAnd, viaPrefix, viaIife, viaDouble, viaArrayKeyed, viaHopDefault, viaIndexKey, viaComputedHop, viaGetter, viaHopDefaultPlain };
import _Iterator from "@core-js/pure/actual/iterator";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// a pattern reading a constructor's static through a container takes it back off the binding pure puts
// in the slot wherever the extraction does not serve it - a catch parameter taking what a throw hands it,
// a loop head and a parameter default taking a selection - so that constructor's import carries its statics
export function caught() {
  try {
    throw {
      C: _Iterator
    };
  } catch ({
    C: {
      from
    }
  }) {
    return from;
  }
}
export function iterated(items) {
  for (const {
    C: {
      for: named
    }
  } of [items ? {
    C: _Symbol
  } : items]) return named;
}
export const defaulted = ({
  C: {
    canParse
  }
} = flag ? {
  C: _URL
} : user) => canParse;
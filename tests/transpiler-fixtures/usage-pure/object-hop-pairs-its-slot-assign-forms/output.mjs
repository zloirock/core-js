import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
function assignForms(f, g) {
  let nestedSeq;
  let seqDefault;
  let hopOrDefault;
  let hopNav;
  let hopOptional;
  ({
    Array: {
      from: nestedSeq
    }
  } = (f(), g(), {
    Array: {
      from: _Array$from
    }
  }));
  f();
  seqDefault = _Map;
  ({
    w: {
      Map: hopOrDefault
    }
  } = {
    w: _globalThis
  });
  ({
    w: {
      Array: {
        from: hopNav
      }
    }
  } = {
    w: _globalThis
  });
  ({
    w: {
      Map: hopOptional
    }
  } = {
    w: _globalThis
  });
  let hopSeq;
  let hopSeqDefault;
  ({
    w: {
      Array: {
        from: hopSeq
      }
    }
  } = {
    w: (f(), g(), _globalThis)
  });
  ({
    w: {
      Map: hopSeqDefault
    }
  } = {
    w: (f(), _globalThis)
  });
  return [nestedSeq, seqDefault, hopOrDefault, hopNav, hopOptional, hopSeq, hopSeqDefault];
}
export default [assignForms(() => 1, () => 2)];
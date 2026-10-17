import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
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
    w: {
      Map: _Map
    }
  });
  ({
    w: {
      Array: {
        from: hopNav
      }
    }
  } = {
    w: {
      Array: {
        from: _Array$from
      }
    }
  });
  ({
    w: {
      Map: hopOptional
    }
  } = {
    w: {
      Map: _Map
    }
  });
  // ... and a SLOT carrying the prefix: the literal stays as a statement of its own, running the
  // prefix where the source ran it, and the level consumes
  let hopSeq;
  let hopSeqDefault;
  ({
    w: {
      Array: {
        from: hopSeq
      }
    }
  } = {
    w: (f(), g(), {
      Array: {
        from: _Array$from
      }
    })
  });
  ({
    w: {
      Map: hopSeqDefault
    }
  } = {
    w: (f(), {
      Map: _Map
    })
  });
  return [nestedSeq, seqDefault, hopOrDefault, hopNav, hopOptional, hopSeq, hopSeqDefault];
}
export default [assignForms(() => 1, () => 2)];
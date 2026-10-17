import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// FULL-consume multi-declarator: the split machinery keeps the lifted effect between siblings
const sC = sideA(),
  {
    Object: {
      fromEntries: fe
    }
  } = (eff(), {
    Object: {
      fromEntries: _Object$fromEntries
    }
  }),
  sD = sideB();
export const r = [sC, fe, sD];
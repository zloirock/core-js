import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Nested leaves retain unrelated siblings at every enclosing level.
// User-object getters and defaults keep their source order; pristine built-in reads
// follow the built-in-read contract across declarations and control-flow hosts.
const box = {
  y: [1]
};
const deep = {
  y: {
    z: [1]
  }
};
const c = 1;
const {
  of: {
    name: hopFirst,
    foo: f1
  },
  junk: j1
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  junk: Array.junk
};
const {
  junk: j2,
  of: {
    name: hopLast,
    foo: f2
  }
} = {
  junk: Array.junk,
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};
const {
  from: F1,
  of: {
    name: hopMiddle,
    foo: f3
  },
  isArray: I1
} = {
  from: _Array$from,
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  isArray: Array.isArray
};
const {
  from: F2,
  of: {
    name: hopAfterStatic,
    foo: f4
  }
} = {
  from: _Array$from,
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};
const {
  of: {
    name: hopBeforeStatic,
    foo: f5
  },
  from: F3
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  from: _Array$from
};
const {
  of: {
    name: hopRest,
    ...r1
  },
  junk: j4
} = {
  of: _Array$of,
  junk: Array.junk
};
const {
  Array: {
    of: {
      name: viaProxyInner,
      foo: f7
    },
    junk: j5
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    },
    junk: _globalThis.Array.junk
  }
};
const {
  Array: {
    junk: j6,
    of: {
      name: viaProxyInnerLast,
      foo: f8
    }
  }
} = {
  Array: {
    junk: _globalThis.Array.junk,
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  }
};
const {
  Array: {
    of: {
      name: viaProxyTwoLevels,
      foo: f9
    },
    junk: j7
  },
  more: m1
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    },
    junk: _globalThis.Array.junk
  },
  more: _globalThis.more
};
const {
  Array: {
    of: {
      name: viaProxyHostSibling,
      foo: f10
    }
  },
  junk: j8
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  },
  junk: _globalThis.junk
};
const {
  Array: {
    of: {
      name: viaProxyCtorSibling,
      foo: f11
    }
  },
  Object: {
    keys: K1
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  },
  Object: {
    keys: _Object$keys
  }
};
const {
  of: {
    name: viaProxyNav,
    foo: f12
  },
  junk: j9
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  junk: Array.junk
};
const {
    y: _ref
  } = box,
  userFirst = _atMaybeArray(_ref),
  {
    other: o1
  } = _ref,
  {
    junk: j10
  } = box;
const {
    junk: j11
  } = box,
  {
    y: _ref2
  } = box,
  userLast = _atMaybeArray(_ref2),
  {
    other: o2
  } = _ref2;
const {
    junk: j12
  } = box,
  {
    y: _ref3 = []
  } = box,
  userDefault = _atMaybeArray(_ref3),
  {
    other: o3
  } = _ref3;
const {
    junk: j13
  } = box,
  {
    y: _ref4
  } = box,
  userMiddle = _atMaybeArray(_ref4),
  {
    other: o4
  } = _ref4,
  {
    more: m2
  } = box;
const {
  y: {
    z: {
      at: userDeep,
      other: o5
    },
    junk: j14
  }
} = deep;
// A single consumed leaf leaves unrelated properties in the residual pattern.
const {
  Array: {
    from: F4,
    of: {
      name: soleBesideStatic
    }
  }
} = {
  Array: {
    from: _Array$from,
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
};
const {
  of: {
    name: soleBesideJunk
  },
  junk: j21
} = {
  of: {
    name: _nameMaybeFunction(_Array$of)
  },
  junk: Array.junk
};
const {
  of: {
    name: soleBesideNavJunk
  },
  junk: j22
} = {
  of: {
    name: _nameMaybeFunction(_Array$of)
  },
  junk: Array.junk
};
const {
  Array: {
    of: {
      name: soleBesideHostJunk
    }
  },
  junk: j23
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  },
  junk: _globalThis.junk
};
const soleUserBesideJunk = _atMaybeArray(box.y);
const {
  junk: j25
} = box;
const {
  junk: j15,
  of: {
    name: viaLet,
    foo: f13
  }
} = {
  junk: Array.junk,
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};
const {
    of: {
      name: viaLeadingDeclarator,
      foo: f14
    },
    junk: j16
  } = {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    },
    junk: Array.junk
  },
  z1 = 1;
const z2 = 1,
  {
    of: {
      name: viaTrailingDeclarator,
      foo: f15
    },
    junk: j17
  } = {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    },
    junk: Array.junk
  };
for (const {
  of: {
    name: viaForInit,
    foo: f16
  },
  junk: j18
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  junk: Array.junk
};;) {
  [viaForInit, f16, j18];
  break;
}
if (c) var {
  of: {
    name: viaBodyless,
    foo: f17
  },
  junk: j19
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  junk: Array.junk
};
export const {
  of: {
    name: viaExport,
    foo: f18
  },
  junk: j20
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  junk: Array.junk
};
export { hopFirst, f1, j1, j2, hopLast, f2, F1, hopMiddle, f3, I1, F2, hopAfterStatic, f4, hopBeforeStatic, f5, F3, hopRest, r1, j4, viaProxyInner, f7, j5, j6, viaProxyInnerLast, f8, viaProxyTwoLevels, f9, j7, m1, viaProxyHostSibling, f10, j8, viaProxyCtorSibling, f11, K1, viaProxyNav, f12, j9, userFirst, o1, j10, j11, userLast, o2, j12, userDefault, o3, j13, userMiddle, o4, m2, userDeep, o5, j14, j15, viaLet, f13, viaLeadingDeclarator, f14, j16, z1, z2, viaTrailingDeclarator, f15, j17, viaBodyless, f17, j19, F4, soleBesideStatic, soleBesideJunk, j21, soleBesideNavJunk, j22, soleBesideHostJunk, j23, soleUserBesideJunk, j25 };
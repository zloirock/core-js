try {} catch ({ [Symbol.iterator]: iter, includes = fb, ...rest }) { iter(); includes("x"); }

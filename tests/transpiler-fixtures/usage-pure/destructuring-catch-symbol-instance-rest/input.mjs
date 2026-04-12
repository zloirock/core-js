try {} catch ({ [Symbol.iterator]: iter, includes, ...rest }) { iter(); includes("x"); }

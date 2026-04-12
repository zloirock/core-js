try {} catch ({ [Symbol.iterator]: iter, ...rest }) { iter(); }

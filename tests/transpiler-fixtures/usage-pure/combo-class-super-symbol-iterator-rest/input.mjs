class A extends Array { static f() { const { [Symbol.iterator]: iter, ...rest } = super.from([]); } }

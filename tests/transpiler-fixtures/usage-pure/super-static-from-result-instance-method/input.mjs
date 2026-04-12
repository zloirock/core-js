class A extends Array { static f() { const arr = super.from([1, 2, 3]); return arr.at(-1); } }

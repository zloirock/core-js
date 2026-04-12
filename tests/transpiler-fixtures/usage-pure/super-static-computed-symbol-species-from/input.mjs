class A extends Array { static [Symbol.species]() { return super.from([]); } }

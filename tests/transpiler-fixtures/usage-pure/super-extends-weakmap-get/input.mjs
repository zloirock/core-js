class A extends WeakMap { static f(k) { return super.getOrInsert(k, 1); } }

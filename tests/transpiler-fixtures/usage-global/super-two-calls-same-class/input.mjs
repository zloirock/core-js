class A extends Promise { static f() { return super.resolve(1); } static g() { return super.allSettled([]); } }

const B = Promise; class A extends B { static f() { return super.resolve(1); } }

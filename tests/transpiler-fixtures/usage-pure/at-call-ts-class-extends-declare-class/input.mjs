declare class Parent { data: string[] }
class Child extends Parent {}
declare const c: Child;
c.data.at(0);

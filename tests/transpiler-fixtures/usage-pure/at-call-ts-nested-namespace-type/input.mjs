namespace A.B {
  export interface MyArr extends Array<string> {}
}
declare const x: A.B.MyArr;
x.at(0);

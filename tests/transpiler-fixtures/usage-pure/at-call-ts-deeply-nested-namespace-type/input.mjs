namespace A.B.C {
  export interface MyArr extends Array<string> {}
}
declare const x: A.B.C.MyArr;
x.at(0);

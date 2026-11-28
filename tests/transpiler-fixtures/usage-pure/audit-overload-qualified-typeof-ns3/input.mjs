declare namespace NS3 {
  function w(x: object): number[];
  function w(x: string): string;
}
declare const call: typeof NS3.w;
declare const choice: any;
call(choice).at(0);

namespace M {
  export enum Promise {
    A = 0
  }
  export class C extends (Promise as any) {
    static run() {
      return super.try(() => 1);
    }
  }
}
M.C.run();
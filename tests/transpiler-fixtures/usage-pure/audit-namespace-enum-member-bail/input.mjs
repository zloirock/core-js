// String conversion fixes the receiver of both reads. The reverse lookup reads the qualified enum itself.
namespace NS {
  export enum E {
    A,
    B,
  }
}
declare const v: NS.E;
const tag = String(v);
tag.at(0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
tag.findLast(c => c === 'A');
NS.E[NS.E.B].includes('B');

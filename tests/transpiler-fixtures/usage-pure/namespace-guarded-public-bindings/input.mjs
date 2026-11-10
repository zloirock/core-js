// A guarded nested receiver is captured privately; only the source method is public.
declare const flag: boolean;
declare const user: any;
export namespace N {
  export const { w: { entries } } = { w: flag ? Object : user };
}

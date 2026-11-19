// Method arity and parameter types survive the receiver capture.
export class Read {
  declare last?: number;
  set value({ at }: number[]) { this.last = at.call([3, 5], -1); }
  async read({ at }: number[]) { return at.call([7], await Promise.resolve(-1)); }
}

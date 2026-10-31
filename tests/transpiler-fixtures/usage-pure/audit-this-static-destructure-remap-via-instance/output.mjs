class Instance extends Array {
  m() {
    const {
      from
    } = this;
    return from;
  }
}
export const viaInstance = new Instance().m();
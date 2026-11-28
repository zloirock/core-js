class Store {
  private data!: Map<string, number>;
  read(key: string) {
    return this.data.get(key);
  }
}
new Store();

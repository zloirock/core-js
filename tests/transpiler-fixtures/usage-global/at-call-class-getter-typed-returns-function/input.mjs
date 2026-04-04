class Store {
  #items: string[] = [];
  get getItems() { return () => this.#items.slice(); }
}
new Store().getItems().at(0).sub();

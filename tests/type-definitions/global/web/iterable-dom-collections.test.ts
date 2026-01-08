import 'core-js/full';

declare const nodeList: NodeList
nodeList.forEach((value: Node, key: number, list: NodeList): void => {});
nodeList.forEach((value: Node, key: number, list: NodeList): void => {}, []);
// @ts-expect-error
nodeList.forEach();

const k1: IterableIterator<number> = nodeList.keys();
// @ts-expect-error
nodeList.keys('string');

const v: IterableIterator<Node> = nodeList.values();
// @ts-expect-error
nodeList.values('string');

const e: IterableIterator<[number, Node]> = nodeList.entries();
// @ts-expect-error
nodeList.entries('string');

declare const domTokenList: DOMTokenList

domTokenList.forEach((value: Node, key: number, list: DOMTokenList): void => {});
domTokenList.forEach((value: Node, key: number, list: DOMTokenList): void => {}, []);
// @ts-expect-error
domTokenList.forEach();

const fomKeys: IterableIterator<number> = domTokenList.keys();
// @ts-expect-error
domTokenList.keys('string');

const domValues: IterableIterator<Element> = domTokenList.values();
// @ts-expect-error
domTokenList.values('string');

const domEntries: IterableIterator<[number, Element]> = domTokenList.entries();
// @ts-expect-error
domTokenList.entries('string');

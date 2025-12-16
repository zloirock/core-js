import 'core-js/full';

declare const nodeList: NodeList
nodeList.forEach((value: Node, key: number, list: NodeList): void => {});
nodeList.forEach((value: Node, key: number, list: NodeList): void => {}, []);
// @ts-expect-error
nodeList.forEach();

const k1: Iterable<number> = nodeList.keys();
// @ts-expect-error
nodeList.keys('string');

const v: Iterable<Node> = nodeList.values();
// @ts-expect-error
nodeList.values('string');

const e: Iterable<[number, Node]> = nodeList.entries();
// @ts-expect-error
nodeList.entries('string');

declare const domTokenList: DOMTokenList

domTokenList.forEach((value: Node, key: number, list: DOMTokenList): void => {});
domTokenList.forEach((value: Node, key: number, list: DOMTokenList): void => {}, []);
// @ts-expect-error
domTokenList.forEach();

const fomKeys: Iterable<number> = domTokenList.keys();
// @ts-expect-error
domTokenList.keys('string');

const domValues: Iterable<Element> = domTokenList.values();
// @ts-expect-error
domTokenList.values('string');

const domEntries: Iterable<[number, Element]> = domTokenList.entries();
// @ts-expect-error
domTokenList.entries('string');

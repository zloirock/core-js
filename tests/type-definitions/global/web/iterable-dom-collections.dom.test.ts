import 'core-js/full';

declare const nodeList: NodeList;
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

declare const domTokenList: DOMTokenList;

domTokenList.forEach((value: string, key: number, list: DOMTokenList): void => {});
domTokenList.forEach((value: string, key: number, list: DOMTokenList): void => {}, []);
// @ts-expect-error
domTokenList.forEach();

const fomKeys: IterableIterator<number> = domTokenList.keys();
// @ts-expect-error
domTokenList.keys('string');

const domValues: IterableIterator<string> = domTokenList.values();
// @ts-expect-error
domTokenList.values('string');

const domEntries: IterableIterator<[number, string]> = domTokenList.entries();
// @ts-expect-error
domTokenList.entries('string');

declare const domStringList: DOMStringList;
const dslIterator: IterableIterator<string> = domStringList[Symbol.iterator]();
// @ts-expect-error
const dslWrong: IterableIterator<DOMStringList> = domStringList[Symbol.iterator]();

declare const dataTransferItemList: DataTransferItemList;
const dtilIterator: IterableIterator<DataTransferItem> = dataTransferItemList[Symbol.iterator]();
// @ts-expect-error
const dtilWrong: IterableIterator<DataTransferItemList> = dataTransferItemList[Symbol.iterator]();

declare const fileList: FileList;
const flIterator: IterableIterator<File> = fileList[Symbol.iterator]();
// @ts-expect-error
const flWrong: IterableIterator<FileList> = fileList[Symbol.iterator]();

declare const htmlAllCollection: HTMLAllCollection;
const hacIterator: IterableIterator<Element> = htmlAllCollection[Symbol.iterator]();
// @ts-expect-error
const hacWrong: IterableIterator<HTMLAllCollection> = htmlAllCollection[Symbol.iterator]();

declare const mediaList: MediaList;
const mlIterator: IterableIterator<string> = mediaList[Symbol.iterator]();
// @ts-expect-error
const mlWrong: IterableIterator<MediaList> = mediaList[Symbol.iterator]();

declare const mimeTypeArray: MimeTypeArray;
const mtaIterator: IterableIterator<MimeType> = mimeTypeArray[Symbol.iterator]();
// @ts-expect-error
const mtaWrong: IterableIterator<MimeTypeArray> = mimeTypeArray[Symbol.iterator]();

declare const namedNodeMap: NamedNodeMap;
const nnmIterator: IterableIterator<Attr> = namedNodeMap[Symbol.iterator]();
// @ts-expect-error
const nnmWrong: IterableIterator<NamedNodeMap> = namedNodeMap[Symbol.iterator]();

declare const paintRequestList: PaintRequestList;
const prlIterator: IterableIterator<PaintRequest> = paintRequestList[Symbol.iterator]();
// @ts-expect-error
const prlWrong: IterableIterator<PaintRequestList> = paintRequestList[Symbol.iterator]();

declare const plugin: Plugin;
const pIterator: IterableIterator<MimeType> = plugin[Symbol.iterator]();
// @ts-expect-error
const pWrong: IterableIterator<Plugin> = plugin[Symbol.iterator]();

declare const pluginArray: PluginArray;
const paIterator: IterableIterator<Plugin> = pluginArray[Symbol.iterator]();
// @ts-expect-error
const paWrong: IterableIterator<PluginArray> = pluginArray[Symbol.iterator]();

declare const svgLengthList: SVGLengthList;
const sllIterator: IterableIterator<SVGLength> = svgLengthList[Symbol.iterator]();
// @ts-expect-error
const sllWrong: IterableIterator<SVGLengthList> = svgLengthList[Symbol.iterator]();

declare const svgNumberList: SVGNumberList;
const snlIterator: IterableIterator<SVGNumber> = svgNumberList[Symbol.iterator]();
// @ts-expect-error
const snlWrong: IterableIterator<SVGNumberList> = svgNumberList[Symbol.iterator]();

declare const svgPathSegList: SVGPathSegList;
const spslIterator: IterableIterator<SVGPathSeg> = svgPathSegList[Symbol.iterator]();
// @ts-expect-error
const spslWrong: IterableIterator<SVGPathSegList> = svgPathSegList[Symbol.iterator]();

declare const svgPointList: SVGPointList;
const splIterator: IterableIterator<DOMPoint> = svgPointList[Symbol.iterator]();
// @ts-expect-error
const splWrong: IterableIterator<SVGPointList> = svgPointList[Symbol.iterator]();

declare const svgStringList: SVGStringList;
const sslIterator: IterableIterator<string> = svgStringList[Symbol.iterator]();
// @ts-expect-error
const sslWrong: IterableIterator<SVGStringList> = svgStringList[Symbol.iterator]();

declare const svgTransformList: SVGTransformList;
const stlIterator: IterableIterator<SVGTransform> = svgTransformList[Symbol.iterator]();
// @ts-expect-error
const stlWrong: IterableIterator<SVGTransformList> = svgTransformList[Symbol.iterator]();

declare const sourceBufferList: SourceBufferList;
const sblIterator: IterableIterator<SourceBuffer> = sourceBufferList[Symbol.iterator]();
// @ts-expect-error
const sblWrong: IterableIterator<SourceBufferList> = sourceBufferList[Symbol.iterator]();

declare const textTrackCueList: TextTrackCueList;
const ttclIterator: IterableIterator<TextTrackCue> = textTrackCueList[Symbol.iterator]();
// @ts-expect-error
const ttclWrong: IterableIterator<TextTrackCueList> = textTrackCueList[Symbol.iterator]();

declare const textTrackList: TextTrackList;
const ttlIterator: IterableIterator<TextTrack> = textTrackList[Symbol.iterator]();
// @ts-expect-error
const ttlWrong: IterableIterator<TextTrackList> = textTrackList[Symbol.iterator]();

declare const touchList: TouchList;
const tlIterator: IterableIterator<Touch> = touchList[Symbol.iterator]();
// @ts-expect-error
const tlWrong: IterableIterator<TouchList> = touchList[Symbol.iterator]();

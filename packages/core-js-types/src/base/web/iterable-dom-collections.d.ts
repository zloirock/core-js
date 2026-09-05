// use only with DOM lib

// Fallbacks for DOM types
interface Element {} // @type-options: no-export
interface Node {} // @type-options: no-export
interface HTMLOptionElement {} // @type-options: no-export
interface CSSValue {} // @type-options: no-export
interface CSSRule {} // @type-options: no-export
interface ClientRect {} // @type-options: no-export
interface DOMRect {} // @type-options: no-export
interface StyleSheet {} // @type-options: no-export
interface DataTransferItem {} // @type-options: no-export
interface File {} // @type-options: no-export
interface MimeType {} // @type-options: no-export
interface Attr {} // @type-options: no-export
interface PaintRequest {} // @type-options: no-export
interface Plugin {} // @type-options: no-export
interface SVGLength {} // @type-options: no-export
interface SVGNumber {} // @type-options: no-export
interface SVGPathSeg {} // @type-options: no-export
interface DOMPoint {} // @type-options: no-export
interface SVGTransform {} // @type-options: no-export
interface SourceBuffer {} // @type-options: no-export
interface TextTrackCue {} // @type-options: no-export
interface TextTrack {} // @type-options: no-export
interface Touch {} // @type-options: no-export

interface ArrayIterator<T> extends IteratorObject<T, BuiltinIteratorReturn, unknown> { // @type-options: no-export
  [Symbol.iterator](): ArrayIterator<T>;
}

interface DOMTokenList { // @type-options: no-export
  /**
   * Calls a defined callback function on each element of the DOMTokenList,
   * passing the element, its index, and the entire DOMTokenList as arguments.
   * @param callbackfn - The function to execute for each element.
   * @param thisArg - Value to use as this when executing `callbackfn`.
   */
  forEach(
    callbackfn: (value: string, index: number, collection: DOMTokenList) => void,
    thisArg?: any
  ): void;

  /**
   * Returns an iterable of keys in the DOMTokenList.
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an iterable of values in the DOMTokenList.
   */
  values(): IterableIterator<string>;

  /**
   * Returns an iterable of key, value pairs in the DOMTokenList.
   */
  entries(): IterableIterator<[number, string]>;

  [Symbol.iterator](): IterableIterator<string>;
}

interface NodeList { // @type-options: no-export
  /**
   * Calls a defined callback function on each element of the NodeList,
   * passing the element, its index, and the entire NodeList as arguments.
   * @param callbackfn - The function to execute for each element.
   * @param thisArg - Value to use as this when executing `callbackfn`.
   */
  forEach(
    callbackfn: (value: Node, index: number, collection: NodeList) => void,
    thisArg?: any
  ): void;

  /**
   * Returns an iterable of keys in the NodeList.
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an iterable of values in the NodeList.
   */
  values(): IterableIterator<Node>;

  /**
   * Returns an iterable of key, value pairs in the NodeList.
   */
  entries(): IterableIterator<[number, Node]>;

  /**
   * Returns an iterable of values in the NodeList.
   */
  [Symbol.iterator](): IterableIterator<Node>;
}

interface CSSRuleList { // @type-options: no-export
  /**
   * Returns an iterable of CSSRule values.
   */
  [Symbol.iterator](): IterableIterator<CSSRule>;
}

interface CSSStyleDeclaration { // @type-options: no-export
  /**
   * Returns an iterable of string values.
   */
  [Symbol.iterator](): IterableIterator<string>;
}

interface CSSValueList { // @type-options: no-export
  /**
   * Returns an iterable of CSSValue values.
   */
  [Symbol.iterator](): IterableIterator<CSSValue>;
}

interface ClientRectList { // @type-options: no-export
  /**
   * Returns an iterable of ClientRect values.
   */
  [Symbol.iterator](): IterableIterator<ClientRect>;
}

interface DOMRectList { // @type-options: no-export
  /**
   * Returns an iterable of DOMRect values.
   */
  [Symbol.iterator](): IterableIterator<DOMRect>;
}

interface DOMStringList { // @type-options: no-export
  /**
   * Returns an iterable of string values.
   */
  [Symbol.iterator](): IterableIterator<string>;
}

interface DataTransferItemList { // @type-options: no-export
  /**
   * Returns an iterable of DataTransferItem values.
   */
  [Symbol.iterator](): IterableIterator<DataTransferItem>;
}

interface FileList { // @type-options: no-export
  /**
   * Returns an iterable of File values.
   */
  [Symbol.iterator](): IterableIterator<File>;
}

interface HTMLAllCollection { // @type-options: no-export
  /**
   * Returns an iterable of Element values.
   */
  [Symbol.iterator](): IterableIterator<Element>;
}

interface HTMLCollection { // @type-options: no-export
  /**
   * Returns an iterable of values in the HTMLCollection.
   */
  [Symbol.iterator](): ArrayIterator<Element>;
}

interface HTMLFormElement { // @type-options: no-export
  /**
   * Returns an iterable of values in the HTMLFormElement.
   */
  [Symbol.iterator](): IterableIterator<Element>;
}

interface HTMLSelectElement { // @type-options: no-export
  /**
   * Returns an iterable of values in the HTMLSelectElement.
   */
  [Symbol.iterator](): IterableIterator<HTMLOptionElement>;
}

interface MediaList { // @type-options: no-export
  /**
   * Returns an iterable of string values.
   */
  [Symbol.iterator](): IterableIterator<string>;
}

interface MimeTypeArray { // @type-options: no-export
  /**
   * Returns an iterable of MimeType values.
   */
  [Symbol.iterator](): IterableIterator<MimeType>;
}

interface NamedNodeMap { // @type-options: no-export
  /**
   * Returns an iterable of Attr values.
   */
  [Symbol.iterator](): IterableIterator<Attr>;
}

interface PaintRequestList { // @type-options: no-export
  /**
   * Returns an iterable of PaintRequest values.
   */
  [Symbol.iterator](): IterableIterator<PaintRequest>;
}

interface Plugin { // @type-options: no-export
  /**
   * Returns an iterable of MimeType values.
   */
  [Symbol.iterator](): IterableIterator<MimeType>;
}

interface PluginArray { // @type-options: no-export
  /**
   * Returns an iterable of Plugin values.
   */
  [Symbol.iterator](): IterableIterator<Plugin>;
}

interface SVGLengthList { // @type-options: no-export
  /**
   * Returns an iterable of SVGLength values.
   */
  [Symbol.iterator](): IterableIterator<SVGLength>;
}

interface SVGNumberList { // @type-options: no-export
  /**
   * Returns an iterable of SVGNumber values.
   */
  [Symbol.iterator](): IterableIterator<SVGNumber>;
}

interface SVGPathSegList { // @type-options: no-export
  /**
   * Returns an iterable of SVGPathSeg values.
   */
  [Symbol.iterator](): IterableIterator<SVGPathSeg>;
}

interface SVGPointList { // @type-options: no-export
  /**
   * Returns an iterable of DOMPoint values.
   * DOMPoint is used instead of SVGPoint because SVGPoint is deprecated and DOMPoint is its replacement.
   */
  [Symbol.iterator](): IterableIterator<DOMPoint>;
}

interface SVGStringList { // @type-options: no-export
  /**
   * Returns an iterable of string values.
   */
  [Symbol.iterator](): IterableIterator<string>;
}

interface SVGTransformList { // @type-options: no-export
  /**
   * Returns an iterable of SVGTransform values.
   */
  [Symbol.iterator](): IterableIterator<SVGTransform>;
}

interface SourceBufferList { // @type-options: no-export
  /**
   * Returns an iterable of SourceBuffer values.
   */
  [Symbol.iterator](): IterableIterator<SourceBuffer>;
}

interface StyleSheetList { // @type-options: no-export
  /**
   * Returns an iterable of StyleSheet values.
   *
   */
  [Symbol.iterator](): IterableIterator<StyleSheet>;
}

interface TextTrackCueList { // @type-options: no-export
  /**
   * Returns an iterable of TextTrackCue values.
   */
  [Symbol.iterator](): IterableIterator<TextTrackCue>;
}

interface TextTrackList { // @type-options: no-export
  /**
   * Returns an iterable of TextTrack values.
   */
  [Symbol.iterator](): IterableIterator<TextTrack>;
}

interface TouchList { // @type-options: no-export
  /**
   * Returns an iterable of Touch values.
   */
  [Symbol.iterator](): IterableIterator<Touch>;
}

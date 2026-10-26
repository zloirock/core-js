// fixture-size: 45 -- Class, loop and later reads jointly expose a removed write during sibling lowering.
class DocTypeReader {
  constructor(options) {
    if (xmlData[i + 3] === 'O' && xmlData[i + 8] === 'E') {
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === '<' && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1) {
              if (this.options.enabled !== false && entityCount >= this.options.maxEntityCount) {
                throw new Error();
              }
              entities[entityName] = {};
            }
          }
        }
      }
    }
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {}
    if (!this.suppressValidationErr && !util.isName(elementName)) {
      while (i < xmlData.length && xmlData[i] !== ")") {
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {}
        if (xmlData[i] === "|") {}
      }
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {}
    }
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {}
    ;
  }
}
const skipWhitespace = (data, index) => {};
function validateEntityName(name) {
  if (util.isName(name)) return name;
}
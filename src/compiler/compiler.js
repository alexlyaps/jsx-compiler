export function compileJSXtoJS(jsx) {
  let tag = "";
  let tagStarted = false;
  let children = "";
  let childrenStarted = false;

  const specialSymbolsSet = new Set(['"', "\\"]);

  for (let i = 0; i < jsx.length; i++) {
    const c = jsx[i];
    if (c === "<" && childrenStarted) {
      break;
    }
    if (c === "<") {
      tagStarted = true;
      continue;
    }

    if (c === ">") {
      tagStarted = false;
      childrenStarted = true;
      continue;
    }
    if (tagStarted) {
      tag += c;
    }
    if (childrenStarted) {
      if (specialSymbolsSet.has(c)) {
        children += "\\";
      }
      children += c;
    }
  }
  const childrenStr = children ? `"${children}"` : "null";
  return `h("${tag}", null, ${childrenStr})`;
}

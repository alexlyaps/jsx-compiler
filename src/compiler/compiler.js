const TokenType = {
  TagOpen: "TagOpen", // <
  TagClose: "TagClose", // >
  TagSlashClose: "TagSlashClose", // />
  ClosingTagOpen: "ClosingTagOpen", // </
  Identifier: "Identifier", // div, class, input
  Equals: "Equals", // =
  String: "String", // "hello"
  Text: "Text", // Hello world
};

function tokenizeJSX(input) {
  const tokens = [];
  let i = 0;
  let insideString = false;
  let insideTag = false;

  const isWhiteSpace = (c) => /\s/.test(c);
  const isIdentifierChar = (c) => /[a-zA-Z0-9_-]/.test(c);

  while (i < input.length) {
    const c = input[i];

    if (!insideTag) {
      if (input.startWith("</", i)) {
        tokens.push({ type: TokenType.ClosingTagOpen, value: "</" });
        i += 2;
        insideTag = true;
        continue;
      }

      if (c === "<") {
        tokens.push({ type: TokenType.TagOpen, value: "<" });
        i++;
        insideTag = true;
        continue;
      }

      let text = "";
      while (i < input.length && input[i] !== "<") {
        text += input[i];
        i++;
      }

      if (text.trim()) {
        tokens.push({ type: TokenType.Text, value: text });
      }

      continue;
    }

    if (isWhiteSpace(c)) {
      i++;
      continue;
    }

    if (input.startsWith("/>", i)) {
      tokens.push({ type: TokenType.TagSlashClose, value: "/>" });
      i += 2;
      insideTag = false;
      continue;
    }

    if (c === ">") {
      tokens.push({ type: TokenType.TagClose, value: ">" });
      i++;
      insideTag = false;
      continue;
    }

    if (c === "=") {
      tokens.push({ type: TokenType.Equals, value: "=" });
      i += 1;
      continue;
    }

    if (c === '"') {
      i += 1;
      let value = "";

      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\" && i + 1 < input.length) {
          value += input[i + 1];
          i += 2;
          continue;
        }

        value += input[i];
        i += 1;
      }

      if (input[i] !== '"') {
        throw new Error("Unterminated string literal");
      }

      i += 1;
      tokens.push({ type: TokenType.String, value });
      continue;
    }

    if (isIdentifierChar(c)) {
      let value = "";

      while (i < input.length && isIdentifierChar(input[i])) {
        value += input[i];
        i += 1;
      }

      tokens.push({ type: TokenType.Identifier, value });
      continue;
    }
  }

  return tokens;
}

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

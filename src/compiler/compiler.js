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
  let insideTag = false;

  const isWhiteSpace = (c) => /\s/.test(c);
  const isIdentifierChar = (c) => /[a-zA-Z0-9_-]/.test(c);

  while (i < input.length) {
    const c = input[i];

    if (!insideTag) {
      if (input.startsWith("</", i)) {
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

function generateAST(tokens) {
  // {
  //   type: "Root",
  //   children: [
  //     {
  //   type: "Element",
  //   tag: "div",
  //   props: {
  //     class: "container}
  //   },
  //   children: [
  //     {
  //       type: "Text",
  //       value: "Hello world"
  //     }
  //   ]
  //  }
  // }

  const root = { type: "Root", children: [] };
  const stack = [root];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    const currentParent = stack[stack.length - 1];

    if (token.type === TokenType.Text) {
      currentParent.children.push({
        type: "Text",
        value: token.value,
      });
      i += 1;
      continue;
    }

    if (token.type === TokenType.TagOpen) {
      i += 1;
      const tagToken = tokens[i];

      if (!tagToken || tagToken.type !== TokenType.Identifier) {
        throw new Error("Expected tag name after <");
      }

      const elementNode = {
        type: "Element",
        tag: tagToken.value,
        props: {},
        children: [],
      };

      i += 1;

      while (
        i < tokens.length &&
        tokens[i].type !== TokenType.TagClose &&
        tokens[i].type !== TokenType.TagSlashClose
      ) {
        const attrNameToken = tokens[i];

        if (attrNameToken.type !== TokenType.Identifier) {
          throw new Error("Expected attribute name");
        }

        const attrName = attrNameToken.value;
        const nextToken = tokens[i + 1];

        if (nextToken && nextToken.type === TokenType.Equals) {
          const valueToken = tokens[i + 2];

          if (!valueToken || valueToken.type !== TokenType.String) {
            throw new Error("Expected string value for attribute");
          }

          elementNode.props[attrName] = valueToken.value;
          i += 3;
        } else {
          elementNode.props[attrName] = true;
          i += 1;
        }
      }

      currentParent.children.push(elementNode);

      if (tokens[i] && tokens[i].type === TokenType.TagSlashClose) {
        i += 1;
        continue;
      }

      if (tokens[i] && tokens[i].type === TokenType.TagClose) {
        i += 1;
        stack.push(elementNode);
        continue;
      }
    }

    if (token.type === TokenType.ClosingTagOpen) {
      i += 1;

      const tagToken = tokens[i];

      if (!tagToken || tagToken.type !== TokenType.Identifier) {
        throw new Error("Expected tag name after </");
      }

      const closingTagName = tagToken.value;
      const currentParent = stack.pop();

      if (currentParent.tag !== closingTagName) {
        throw new Error(
          `Mismatched closing tag: expected </${currentParent.tag}> but found </${closingTagName}>`,
        );
      }

      i += 1;

      if (!tokens[i] || tokens[i].type !== TokenType.TagClose) {
        throw new Error("Expected > after closing tag name");
      }

      i += 1;
      continue;
    }
  }

  if (stack.length !== 1) {
    throw new Error("Unclosed tags detected");
  }

  return root;
}

const tokens = tokenizeJSX(
  '<div class="container">Hello <span>world</span></div>',
);
const ast = generateAST(tokens);
console.log(JSON.stringify(ast, null, 2));

// export function compileJSXtoJS(jsx) {
//   let tag = "";
//   let tagStarted = false;
//   let children = "";
//   let childrenStarted = false;

//   const specialSymbolsSet = new Set(['"', "\\"]);

//   for (let i = 0; i < jsx.length; i++) {
//     const c = jsx[i];
//     if (c === "<" && childrenStarted) {
//       break;
//     }
//     if (c === "<") {
//       tagStarted = true;
//       continue;
//     }

//     if (c === ">") {
//       tagStarted = false;
//       childrenStarted = true;
//       continue;
//     }
//     if (tagStarted) {
//       tag += c;
//     }
//     if (childrenStarted) {
//       if (specialSymbolsSet.has(c)) {
//         children += "\\";
//       }
//       children += c;
//     }
//   }
//   const childrenStr = children ? `"${children}"` : "null";
//   return `h("${tag}", null, ${childrenStr})`;
// }

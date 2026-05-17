// h("div", {"class":"container"}, ["Hello ", h("span", {}, ["world"])])
export function h(type, props, children) {
  const el = document.createElement(type);

  for (const [key, value] of Object.entries(props)) {
    el.setAttribute(key, value);
  }

  for (const child of children) {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

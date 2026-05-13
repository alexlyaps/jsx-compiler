export function h(type, props, children) {
  const el = document.createElement(type);
  el.textContent = children;

  return el;
}

export function render(node, container) {
  console.log(container);
  container.innerHTML = "";
  container.appendChild(node);
}

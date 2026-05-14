import { h } from "./compiler/h";
import { compileJSXtoJS } from "./compiler/compiler";
import { Observer } from "./state/observer";

const root = document.querySelector("#app");

const observer = new Observer({ name: "Alex" });
observer.subscribe(render);

const input = document.createElement("input");

input.addEventListener("input", (e) => {
  const value = e.target.value;
  console.log(value);
  observer.setState({ name: value });
});

function render() {
  const jsx = `<h1>Hello ${observer.getState().name}</h1>`;
  const code = compileJSXtoJS(jsx);
  const fn = new Function("h", `return ${code}`);
  const result = fn(h);

  root.innerHTML = "";
  root.appendChild(result);
  root.appendChild(input);
}

render();

import { h } from "./compiler/h";
import { compileJSXtoJS } from "./compiler/compiler";
import { Observer } from "./state/observer";
import { render } from "./runtime/render";

const root = document.querySelector("#app");

const observer = new Observer({ name: "Alex" });
observer.subscribe(render);

const jsx = `<div class="container">Hello <span>Alex</span><input id="name" /></div>`;

const jsCode = compileJSXtoJS(jsx);
console.log(jsCode);

const fn = new Function("h", `return ${jsCode}`);
const result = fn(h);

const input = result.querySelector("#name");

input.addEventListener("input", (e) => {
  const value = e.target.value;
  console.log(value);
  observer.setState({ name: value });
});

render(result, root);

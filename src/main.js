import { h } from "./compiler/h";
import { compileJSXtoJS } from "./compiler/compiler";

const root = document.querySelector("#app");
const jsx = "<h1>Hello You</h1>";
const code = compileJSXtoJS(jsx);

const fn = new Function("h", `return ${code}`);
const result = fn(h);

root.appendChild(result);

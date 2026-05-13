import { h } from "./compiler/h";
import { compileJSXtoJS } from "./compiler/compiler";

const root = document.querySelector("#app");
const jsx = "<h1>Hello You</h1>";
const code = compileJSXtoJS(jsx);

const result = eval(code);

root.appendChild(result);

import { createRoot } from "react-dom/client";
import App from "./app/App";
// @ts-ignore: CSS module declarations are handled by the build pipeline
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
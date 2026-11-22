import GrammarInput from "./components/GrammarInput.jsx";
import { MathJaxContext } from "better-react-mathjax";
export default function App() {
  return (
    <MathJaxContext>
      <GrammarInput />
    </MathJaxContext>
  );
}

import GrammarInput from "./components/GrammarInput";
import { MathJaxContext } from "better-react-mathjax";
export default function App() {

  const handleGrammarSubmit = (rules) => {
    console.log("Розібрана граматика:", rules);
    rules.forEach((rule) => console.log(rule.toString())); // Вивід у консоль
  };

  return (
    <div>
      <MathJaxContext>
        <GrammarInput onSubmit={handleGrammarSubmit} />
      </MathJaxContext>
    </div>
  );
}

import GrammarInput from "./components/GrammarInput";

export default function App() {

  const handleGrammarSubmit = (rules) => {
    console.log("Розібрана граматика:", rules);
    rules.forEach((rule) => console.log(rule.toString())); // Вивід у консоль
  };

  return (
    <div>
      <GrammarInput onSubmit={handleGrammarSubmit} />
    </div>
  );
}

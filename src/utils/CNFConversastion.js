export class CNFConversion {
    addNewStartSymbol(rules) {
      const rule = rules[0];
      const startSymbol = rule.leftSide;
      const newStartSymbol = startSymbol + "_0";
  
      // Створення альтернатив для нового стартового символу
      const alternative1 = [startSymbol]; // Альтернатива S
      const alternative2 = ["ε"]; // Альтернатива ε
  
      // Додавання нового правила до списку правил
      const rightSideForNewStartSymbol = [alternative1, alternative2];
  
      rules.unshift({ leftSide: newStartSymbol, rightSide: rightSideForNewStartSymbol });
    }    
  
    conversionToCNF(rules) {
      // Список для нових правил
      const newRules = [];
  
      // Для збереження замін терміналів на нові нетермінали
      const terminalToNonTerminal = {};
  
      // Для унікальних правих частин
      const uniqueRightSides = {};
      let terminalCounter = 1;
      let nonTerminalCounter = 1;
  
      // Знаходимо всі нетермінали
      const nonTerminals = new Set();
      rules.forEach(rule => {
        nonTerminals.add(rule.leftSide);
      });
  
      // Обробляємо кожне правило
      rules.forEach(rule => {
        const updatedRightSide = [];
  
        rule.rightSide.forEach(production => {
          const updatedProduction = [];
  
          production.forEach(symbol => {
            // Якщо це термінал (знаходиться тільки у правих частинах)
            if (!nonTerminals.has(symbol) && production.length > 1) {
              // Якщо термінал ще не замінено
              if (!terminalToNonTerminal[symbol]) {
                const newNonTerminal = "T" + terminalCounter++;
                terminalToNonTerminal[symbol] = newNonTerminal;
                newRules.push({ leftSide: newNonTerminal, rightSide: [[symbol]] });
              }
              updatedProduction.push(terminalToNonTerminal[symbol]);
            } else {
              updatedProduction.push(symbol);
            }
          });
  
          // Розбиття на пари, якщо довжина більше 2
          while (updatedProduction.length > 2) {
            const first = updatedProduction.shift();
            const second = updatedProduction[0];
  
            // Створюємо новий нетермінал або використовуємо існуючий
            const pair = [first, second];
            let newNonTerminal;
  
            if (uniqueRightSides[pair]) {
              newNonTerminal = uniqueRightSides[pair];
            } else {
              newNonTerminal = "N" + nonTerminalCounter++;
              uniqueRightSides[pair] = newNonTerminal;
              newRules.push({ leftSide: newNonTerminal, rightSide: [pair] });
            }
  
            updatedProduction[0] = newNonTerminal;
          }
  
          updatedRightSide.push(updatedProduction);
        });
  
        rule.rightSide = updatedRightSide;
      });
  
      // Додаємо нові правила до списку
      rules.push(...newRules);
    }
  }
  
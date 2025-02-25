export class RemovingUselessSymbols {
  constructor() {
    this.terminatingSymbols = new Set();
    this.explanations = []; // Масив для пояснень
  }

  // Видалення символів, що не завершуються
  removeNotTerminatingSymbols(rules) {
    this.rules = rules;
    // Крок 1: Знайти всі термінальні символи
    for (const rule of rules) {
      for (const alternatives of rule.rightSide) {
        for (const symbol of alternatives) {
          if (this.isTerminal(symbol, rules) && symbol !== "ε") { // тут ми добавляєм все термінали
            this.terminatingSymbols.add(symbol);
          }
        }
      }
    }

    // Крок 2: Ітеративно знаходити нетермінали, що завершуються
    this.explanations.push("Teraz iteratívne hľadáme neterminály, ktoré sa končia.");
    let added;
    do {
      added = false;
      for (const rule of rules) {
        if (!this.terminatingSymbols.has(rule.leftSide)) {
          for (const alternatives of rule.rightSide) {
            if (alternatives.every((symbol) => this.terminatingSymbols.has(symbol))) { // якщо в альтернативі кожен символ є в списку terminatingSymbols
              this.terminatingSymbols.add(rule.leftSide);
              added = true;
              this.explanations.push(`Neterminál ${rule.leftSide} sa pridáva do množiny terminálnych symbolov.`);
              break;
            }
          }
        }
      }
    } while (added);

    this.explanations.push(`Určená množina terminálnych symbolov: {${[...this.terminatingSymbols].join(", ")}}.`);

    // Оновлення правил, видаляючи альтернативи з не завершеними символами
    let updatedRules = [];
    for (const rule of rules) {
      const newRightSide = rule.rightSide.filter((alternatives) => // тут якщо кожен символ альтернативи є в списку terminatingSymbols то ми цю альтернативу лишаємо
        alternatives.every((symbol) => this.terminatingSymbols.has(symbol))
      );
      
      if (newRightSide.length < rule.rightSide.length) {
        this.explanations.push(`Pravidlo ${rule.leftSide} bolo aktualizované, pretože niektoré alternatívy obsahovali symboly, ktoré nepatria do množiny terminálnych symbolov.`);
        rule.rightSide = newRightSide;
        this.explanations.push(this.toString());
      }

      // Додаємо тільки ті правила, у яких є непорожні праві частини
      if (newRightSide.length > 0) {
        updatedRules.push(rule);
      }
    }

    // Після видалення порожніх правил
    updatedRules = this.removeEmptyRules(updatedRules);

    return updatedRules;
}

  // Видалення недосяжних символів
  removeUnreachableSymbols(rules) {
    this.explanations.push("Začíname hľadať nedosiahnuteľné symboly. Sú to symboly, ku ktorým sa môžeme dostať z počiatočného symbolu priamo alebo prechodom cez neterminály.");
    const reachableSymbols = new Set();
    this.explanations.push(`Počiatočný symbol: ${rules[0].leftSide}`);
    reachableSymbols.add(rules[0].leftSide); // Додаємо початковий символ

    let added;
    do {
      added = false;
      for (const rule of rules) {
        if (reachableSymbols.has(rule.leftSide)) { // якщо в списку є цей нетермінал то ми добавляєм в список всі його символи з альтернативи
          for (const alternative of rule.rightSide) {
            for (const symbol of alternative) {
              if (!reachableSymbols.has(symbol)) {
                reachableSymbols.add(symbol);
                added = true;
                this.explanations.push(`Symbol ${symbol} sa pridáva do množiny dosiahnuteľných symbolov.`);
              }
            }
          }
        }
      }
    } while (added);

    this.explanations.push(`Definovaná množina dosiahnuteľných symbolov: {${[...reachableSymbols].join(", ")}}.`);


    // Додаємо пояснення перед видаленням
    this.explanations.push("Odstraňujeme nedosiahnuteľné pravidlá.");

    // Видаляємо правила з недосяжними лівими частинами та оновлюємо rules
    const updatedRules = rules.filter((rule) => reachableSymbols.has(rule.leftSide));

    // Форматуємо правила з нового рядка
    const formattedRules = updatedRules.map(rule => `${rule.leftSide} → ${rule.rightSide.map(alt => alt.join(" ")).join(" | ")}`).join("\n");

    // Додаємо відформатовані правила
    this.explanations.push(formattedRules);
    
    return updatedRules;
}


  // Перевірка, чи є символ терміналом
  isTerminal(symbol, rules) {
    return rules.every(rule => rule.leftSide !== symbol && symbol[0] === symbol[0].toLowerCase());
  }

  // Видалення порожніх правил
  removeEmptyRules(rules) {
    this.rules = rules;
    this.explanations.push("Odstraňujeme prázdne pravidlá.");
    const updatedRules = rules.filter((rule) => rule.rightSide.length > 0);
    if (updatedRules.length < rules.length) {
      this.explanations.push("Boli odstránené prázdne pravidlá.");
    }
    this.explanations.push(this.toString());
    return updatedRules;
}

  toString() {
    return this.rules.map(rule => {
      const alternatives = rule.rightSide.map(alt => alt.join(" ")).join(" | ");
      return `${rule.leftSide} → ${alternatives}`;
    }).join("\n");
  }

}

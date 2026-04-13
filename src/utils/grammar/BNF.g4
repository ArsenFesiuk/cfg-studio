grammar BNF;

// Parser Rules
bnf         : pravidlo+ EOF ;

pravidlo    : NETERMINAL '::=' pravastrana ;

pravastrana : postupnost ('|' postupnost)* ;

postupnost  : 'ε'
            | symbol+
            ;

symbol      : TERMINAL
            | NETERMINAL
            ;

// Lexer Rules
// NETERMINAL includes angle brackets so it is distinct from TERMINAL.
// Without this, both tokens match bare identifiers and ANTLR always
// picks TERMINAL (first-defined wins), making NETERMINAL unreachable.
NETERMINAL  : '<' [a-zA-Z][a-zA-Z0-9_\-]* '>' ;
TERMINAL    : [a-zA-Z0-9_\-]+ ;
WS          : [ \t\r\n]+ -> skip ;

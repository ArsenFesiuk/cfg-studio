grammar EBNF;

// Parser Rules
ebnf        : pravidlo+ EOF ;

pravidlo    : NETERMINAL '::=' pravastrana ;

pravastrana : postupnost ('|' postupnost)* ;

postupnost  : 'ε'
            | element+
            ;

element     : TERMINAL               // terminál v úvodzovkách
            | NETERMINAL             // neterminál (bare identifier)
            | '(' pravastrana ')'   // zoskupenie
            | '[' pravastrana ']'   // voliteľnosť (0 alebo 1)
            | '{' pravastrana '}'   // Kleeneho uzáver (0 alebo viac)
            ;

// Lexer Rules
// TERMINAL includes surrounding quotes so it is distinct from NETERMINAL.
// Without this, both tokens match bare identifiers and ANTLR always
// picks TERMINAL (first-defined wins), making NETERMINAL unreachable.
TERMINAL    : '"' [a-zA-Z0-9_\-+=*]+ '"' ;
NETERMINAL  : [a-zA-Z][a-zA-Z0-9_\-+=*]*  ;
WS          : [ \t\r\n]+ -> skip ;


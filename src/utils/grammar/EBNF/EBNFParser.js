// Generated from EBNF.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';
import EBNFListener from './EBNFListener.js';
const serializedATN = [4,1,12,54,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,
1,0,4,0,12,8,0,11,0,12,0,13,1,0,1,0,1,1,1,1,1,1,1,1,1,2,1,2,1,2,5,2,25,8,
2,10,2,12,2,28,9,2,1,3,1,3,4,3,32,8,3,11,3,12,3,33,3,3,36,8,3,1,4,1,4,1,
4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,3,4,52,8,4,1,4,0,0,5,0,2,4,
6,8,0,0,56,0,11,1,0,0,0,2,17,1,0,0,0,4,21,1,0,0,0,6,35,1,0,0,0,8,51,1,0,
0,0,10,12,3,2,1,0,11,10,1,0,0,0,12,13,1,0,0,0,13,11,1,0,0,0,13,14,1,0,0,
0,14,15,1,0,0,0,15,16,5,0,0,1,16,1,1,0,0,0,17,18,5,11,0,0,18,19,5,1,0,0,
19,20,3,4,2,0,20,3,1,0,0,0,21,26,3,6,3,0,22,23,5,2,0,0,23,25,3,6,3,0,24,
22,1,0,0,0,25,28,1,0,0,0,26,24,1,0,0,0,26,27,1,0,0,0,27,5,1,0,0,0,28,26,
1,0,0,0,29,36,5,3,0,0,30,32,3,8,4,0,31,30,1,0,0,0,32,33,1,0,0,0,33,31,1,
0,0,0,33,34,1,0,0,0,34,36,1,0,0,0,35,29,1,0,0,0,35,31,1,0,0,0,36,7,1,0,0,
0,37,52,5,10,0,0,38,52,5,11,0,0,39,40,5,4,0,0,40,41,3,4,2,0,41,42,5,5,0,
0,42,52,1,0,0,0,43,44,5,6,0,0,44,45,3,4,2,0,45,46,5,7,0,0,46,52,1,0,0,0,
47,48,5,8,0,0,48,49,3,4,2,0,49,50,5,9,0,0,50,52,1,0,0,0,51,37,1,0,0,0,51,
38,1,0,0,0,51,39,1,0,0,0,51,43,1,0,0,0,51,47,1,0,0,0,52,9,1,0,0,0,5,13,26,
33,35,51];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class EBNFParser extends antlr4.Parser {

    static grammarFileName = "EBNF.g4";
    static literalNames = [ null, "'::='", "'|'", "'\\u03B5'", "'('", "')'", 
                            "'['", "']'", "'{'", "'}'" ];
    static symbolicNames = [ null, null, null, null, null, null, null, null, 
                             null, null, "TERMINAL", "NETERMINAL", "WS" ];
    static ruleNames = [ "ebnf", "pravidlo", "pravastrana", "postupnost", 
                         "element" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = EBNFParser.ruleNames;
        this.literalNames = EBNFParser.literalNames;
        this.symbolicNames = EBNFParser.symbolicNames;
    }



	ebnf() {
	    let localctx = new EbnfContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, EBNFParser.RULE_ebnf);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 11; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 10;
	            this.pravidlo();
	            this.state = 13; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        } while(_la===11);
	        this.state = 15;
	        this.match(EBNFParser.EOF);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	pravidlo() {
	    let localctx = new PravidloContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, EBNFParser.RULE_pravidlo);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 17;
	        this.match(EBNFParser.NETERMINAL);
	        this.state = 18;
	        this.match(EBNFParser.T__0);
	        this.state = 19;
	        this.pravastrana();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	pravastrana() {
	    let localctx = new PravastranaContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, EBNFParser.RULE_pravastrana);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 21;
	        this.postupnost();
	        this.state = 26;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===2) {
	            this.state = 22;
	            this.match(EBNFParser.T__1);
	            this.state = 23;
	            this.postupnost();
	            this.state = 28;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	postupnost() {
	    let localctx = new PostupnostContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, EBNFParser.RULE_postupnost);
	    try {
	        this.state = 35;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 29;
	            this.match(EBNFParser.T__2);
	            break;
	        case 4:
	        case 6:
	        case 8:
	        case 10:
	        case 11:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 31; 
	            this._errHandler.sync(this);
	            var _alt = 1;
	            do {
	            	switch (_alt) {
	            	case 1:
	            		this.state = 30;
	            		this.element();
	            		break;
	            	default:
	            		throw new antlr4.error.NoViableAltException(this);
	            	}
	            	this.state = 33; 
	            	this._errHandler.sync(this);
	            	_alt = this._interp.adaptivePredict(this._input,2, this._ctx);
	            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	element() {
	    let localctx = new ElementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, EBNFParser.RULE_element);
	    try {
	        this.state = 51;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 10:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 37;
	            this.match(EBNFParser.TERMINAL);
	            break;
	        case 11:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 38;
	            this.match(EBNFParser.NETERMINAL);
	            break;
	        case 4:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 39;
	            this.match(EBNFParser.T__3);
	            this.state = 40;
	            this.pravastrana();
	            this.state = 41;
	            this.match(EBNFParser.T__4);
	            break;
	        case 6:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 43;
	            this.match(EBNFParser.T__5);
	            this.state = 44;
	            this.pravastrana();
	            this.state = 45;
	            this.match(EBNFParser.T__6);
	            break;
	        case 8:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 47;
	            this.match(EBNFParser.T__7);
	            this.state = 48;
	            this.pravastrana();
	            this.state = 49;
	            this.match(EBNFParser.T__8);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

EBNFParser.EOF = antlr4.Token.EOF;
EBNFParser.T__0 = 1;
EBNFParser.T__1 = 2;
EBNFParser.T__2 = 3;
EBNFParser.T__3 = 4;
EBNFParser.T__4 = 5;
EBNFParser.T__5 = 6;
EBNFParser.T__6 = 7;
EBNFParser.T__7 = 8;
EBNFParser.T__8 = 9;
EBNFParser.TERMINAL = 10;
EBNFParser.NETERMINAL = 11;
EBNFParser.WS = 12;

EBNFParser.RULE_ebnf = 0;
EBNFParser.RULE_pravidlo = 1;
EBNFParser.RULE_pravastrana = 2;
EBNFParser.RULE_postupnost = 3;
EBNFParser.RULE_element = 4;

class EbnfContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_ebnf;
    }

	EOF() {
	    return this.getToken(EBNFParser.EOF, 0);
	};

	pravidlo = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(PravidloContext);
	    } else {
	        return this.getTypedRuleContext(PravidloContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterEbnf(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitEbnf(this);
		}
	}


}



class PravidloContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_pravidlo;
    }

	NETERMINAL() {
	    return this.getToken(EBNFParser.NETERMINAL, 0);
	};

	pravastrana() {
	    return this.getTypedRuleContext(PravastranaContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterPravidlo(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitPravidlo(this);
		}
	}


}



class PravastranaContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_pravastrana;
    }

	postupnost = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(PostupnostContext);
	    } else {
	        return this.getTypedRuleContext(PostupnostContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterPravastrana(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitPravastrana(this);
		}
	}


}



class PostupnostContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_postupnost;
    }

	element = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ElementContext);
	    } else {
	        return this.getTypedRuleContext(ElementContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterPostupnost(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitPostupnost(this);
		}
	}


}



class ElementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = EBNFParser.RULE_element;
    }

	TERMINAL() {
	    return this.getToken(EBNFParser.TERMINAL, 0);
	};

	NETERMINAL() {
	    return this.getToken(EBNFParser.NETERMINAL, 0);
	};

	pravastrana() {
	    return this.getTypedRuleContext(PravastranaContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.enterElement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof EBNFListener ) {
	        listener.exitElement(this);
		}
	}


}




EBNFParser.EbnfContext = EbnfContext; 
EBNFParser.PravidloContext = PravidloContext; 
EBNFParser.PravastranaContext = PravastranaContext; 
EBNFParser.PostupnostContext = PostupnostContext; 
EBNFParser.ElementContext = ElementContext; 

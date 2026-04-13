// Generated from BNF.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';
import BNFListener from './BNFListener.js';
const serializedATN = [4,1,6,40,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,
1,0,4,0,12,8,0,11,0,12,0,13,1,0,1,0,1,1,1,1,1,1,1,1,1,2,1,2,1,2,5,2,25,8,
2,10,2,12,2,28,9,2,1,3,1,3,4,3,32,8,3,11,3,12,3,33,3,3,36,8,3,1,4,1,4,1,
4,0,0,5,0,2,4,6,8,0,1,1,0,4,5,38,0,11,1,0,0,0,2,17,1,0,0,0,4,21,1,0,0,0,
6,35,1,0,0,0,8,37,1,0,0,0,10,12,3,2,1,0,11,10,1,0,0,0,12,13,1,0,0,0,13,11,
1,0,0,0,13,14,1,0,0,0,14,15,1,0,0,0,15,16,5,0,0,1,16,1,1,0,0,0,17,18,5,4,
0,0,18,19,5,1,0,0,19,20,3,4,2,0,20,3,1,0,0,0,21,26,3,6,3,0,22,23,5,2,0,0,
23,25,3,6,3,0,24,22,1,0,0,0,25,28,1,0,0,0,26,24,1,0,0,0,26,27,1,0,0,0,27,
5,1,0,0,0,28,26,1,0,0,0,29,36,5,3,0,0,30,32,3,8,4,0,31,30,1,0,0,0,32,33,
1,0,0,0,33,31,1,0,0,0,33,34,1,0,0,0,34,36,1,0,0,0,35,29,1,0,0,0,35,31,1,
0,0,0,36,7,1,0,0,0,37,38,7,0,0,0,38,9,1,0,0,0,4,13,26,33,35];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class BNFParser extends antlr4.Parser {

    static grammarFileName = "BNF.g4";
    static literalNames = [ null, "'::='", "'|'", "'\\u03B5'" ];
    static symbolicNames = [ null, null, null, null, "NETERMINAL", "TERMINAL", 
                             "WS" ];
    static ruleNames = [ "bnf", "pravidlo", "pravastrana", "postupnost", 
                         "symbol" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = BNFParser.ruleNames;
        this.literalNames = BNFParser.literalNames;
        this.symbolicNames = BNFParser.symbolicNames;
    }



	bnf() {
	    let localctx = new BnfContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, BNFParser.RULE_bnf);
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
	        } while(_la===4);
	        this.state = 15;
	        this.match(BNFParser.EOF);
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
	    this.enterRule(localctx, 2, BNFParser.RULE_pravidlo);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 17;
	        this.match(BNFParser.NETERMINAL);
	        this.state = 18;
	        this.match(BNFParser.T__0);
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
	    this.enterRule(localctx, 4, BNFParser.RULE_pravastrana);
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
	            this.match(BNFParser.T__1);
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
	    this.enterRule(localctx, 6, BNFParser.RULE_postupnost);
	    try {
	        this.state = 35;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 3:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 29;
	            this.match(BNFParser.T__2);
	            break;
	        case 4:
	        case 5:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 31; 
	            this._errHandler.sync(this);
	            var _alt = 1;
	            do {
	            	switch (_alt) {
	            	case 1:
	            		this.state = 30;
	            		this.symbol();
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



	symbol() {
	    let localctx = new SymbolContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, BNFParser.RULE_symbol);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 37;
	        _la = this._input.LA(1);
	        if(!(_la===4 || _la===5)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
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

BNFParser.EOF = antlr4.Token.EOF;
BNFParser.T__0 = 1;
BNFParser.T__1 = 2;
BNFParser.T__2 = 3;
BNFParser.NETERMINAL = 4;
BNFParser.TERMINAL = 5;
BNFParser.WS = 6;

BNFParser.RULE_bnf = 0;
BNFParser.RULE_pravidlo = 1;
BNFParser.RULE_pravastrana = 2;
BNFParser.RULE_postupnost = 3;
BNFParser.RULE_symbol = 4;

class BnfContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = BNFParser.RULE_bnf;
    }

	EOF() {
	    return this.getToken(BNFParser.EOF, 0);
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
	    if(listener instanceof BNFListener ) {
	        listener.enterBnf(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof BNFListener ) {
	        listener.exitBnf(this);
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
        this.ruleIndex = BNFParser.RULE_pravidlo;
    }

	NETERMINAL() {
	    return this.getToken(BNFParser.NETERMINAL, 0);
	};

	pravastrana() {
	    return this.getTypedRuleContext(PravastranaContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof BNFListener ) {
	        listener.enterPravidlo(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof BNFListener ) {
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
        this.ruleIndex = BNFParser.RULE_pravastrana;
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
	    if(listener instanceof BNFListener ) {
	        listener.enterPravastrana(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof BNFListener ) {
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
        this.ruleIndex = BNFParser.RULE_postupnost;
    }

	symbol = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SymbolContext);
	    } else {
	        return this.getTypedRuleContext(SymbolContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof BNFListener ) {
	        listener.enterPostupnost(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof BNFListener ) {
	        listener.exitPostupnost(this);
		}
	}


}



class SymbolContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = BNFParser.RULE_symbol;
    }

	TERMINAL() {
	    return this.getToken(BNFParser.TERMINAL, 0);
	};

	NETERMINAL() {
	    return this.getToken(BNFParser.NETERMINAL, 0);
	};

	enterRule(listener) {
	    if(listener instanceof BNFListener ) {
	        listener.enterSymbol(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof BNFListener ) {
	        listener.exitSymbol(this);
		}
	}


}




BNFParser.BnfContext = BnfContext; 
BNFParser.PravidloContext = PravidloContext; 
BNFParser.PravastranaContext = PravastranaContext; 
BNFParser.PostupnostContext = PostupnostContext; 
BNFParser.SymbolContext = SymbolContext; 

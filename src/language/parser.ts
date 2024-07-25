import ohm from "ohm-js";
export default class ModuloParser {
  moduloGrammar: ohm.Grammar;

  //   Line = IfExpr (~end IfExpr)* eol?
  //     IfExpr = "IF" Condition "RETURN" ReturnValue
  //     ReturnValue = Color
  //     Condition = BiCondition | MonoCondition
  //     BiCondition = Condition "And" Condition
  //     MonoCondition = AddExp Operator

  constructor() {
    this.moduloGrammar = ohm.grammar(String.raw`
Arithmetic {
  Exp
    = UnionExp

  UnionExp
    = UnionExp "&cup;" InterExp  -- plus    
    | InterExp

  InterExp
    = InterExp "&cap;" PriExp  -- times    
    | PriExp

  PriExp
    = "(" Exp ")"  -- paren    
    | ident
  

  ident  (an identifier)
    = "A"
    | "B"
    | "C"
  
}
`);
  }

  parse(program: string) {
    return this.moduloGrammar.match(program);
  }
}


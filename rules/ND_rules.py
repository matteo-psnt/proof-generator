from logic.logic import AND, OR, NOT, IMP, IFF, VAR

class Rule:
    '''Abstract class for a rule'''
    rule_name = None
    
    def can_apply(self, expr):
        raise NotImplementedError
    
    def apply(self, expr):
        raise NotImplementedError

    def apply_list(self, expr_list):
        raise NotImplementedError

class OneInputRule(Rule):
    '''Abstract class for a rule with one input'''
    
    def apply_list(self, expr_list):
        new_expr_list = set()
        for expr in expr_list:
            if self.can_apply(expr):
                new_expr_list.add(self.apply(expr))
        return list(new_expr_list)

class TwoInputRule(Rule):
    '''Abstract class for a rule with two inputs'''
    
    def can_apply(self, expr1, expr2):
        raise NotImplementedError
    
    def apply(self, expr1, expr2):
        raise NotImplementedError
    
    def apply_list(self, expr_list):
        new_expr_list = set()
        for i in range(len(expr_list)):
            for j in range(i + 1, len(expr_list)):
                if self.can_apply(expr_list[i], expr_list[j]):
                    new_expr_list.add(self.apply(expr_list[i], expr_list[j]))
        return list(new_expr_list)

class OtherOneInputRule(Rule):
    '''Abstract class for a rule with one other input'''
    
    def can_apply(self, expr, other):
        raise NotImplementedError
    
    def apply(self, expr, other):
        raise NotImplementedError
    
    def apply_list(self, expr_list):
        pass

class OtherTwoInputRule(Rule):
    '''Abstract class for a rule with two other inputs'''
    
    def can_apply(self, expr1, expr2, other):
        raise NotImplementedError
    
    def apply(self, expr1, expr2, other):
        raise NotImplementedError
    
    def apply_list(self, expr_list):
        pass

class AndIntroduction(TwoInputRule):
    '''Rule for and introduction'''
    rule_name = 'and_i'
    
    def can_apply(self, expr1, expr2):
        return True
    
    def apply(self, expr1, expr2):
        return AND(expr1, expr2)

class AndEliminationLeft(OneInputRule):
    '''Rule for and elimination'''
    rule_name = 'and_e'
    
    def can_apply(self, expr):
        return isinstance(expr, AND)
    
    def apply(self, expr):
        return expr.left

class AndEliminationRight(OneInputRule):
    '''Rule for and elimination'''
    rule_name = 'and_e'
    
    def can_apply(self, expr):
        return isinstance(expr, AND)
    
    def apply(self, expr):
        return expr.right

class OrIntroduction(OtherOneInputRule):
    '''Rule for or introduction'''
    rule_name = 'or_i'
    
    def can_apply(self, expr, other):
        return True

    def apply(self, expr, other):
        return OR(expr, other)

class OrElimination(TwoInputRule):
    '''Rule for or elimination'''
    rule_name = 'or_e'
    pass

class ImpliesIntroduction(OneInputRule):
    '''Rule for implies introduction'''
    rule_name = 'imp_i'
    pass

class ImpliesElimination(OtherOneInputRule):
    '''Rule for implies elimination'''
    rule_name = 'imp_e'
    
    def can_apply(self, expr, other):
        return isinstance(expr, IMP) and expr.left == other

class NotIntroduction(OneInputRule):
    '''Rule for not introduction'''
    rule_name = 'not_i'
    pass

class NotElimination(OtherTwoInputRule):
    '''Rule for not elimination'''
    rule_name = 'not_e'
    
    def can_apply(self, expr1, expr2, other):
        return isinstance(expr1, NOT) and expr2 == expr1.expression
    
    def apply(self, expr1, expr2, other):
        return other

class NotNotIntroduction(OneInputRule):
    '''Rule for not not introduction'''
    rule_name = 'not_not_i'
    
    def can_apply(self, expr):
        return not isinstance(expr, NOT)
    
    def apply(self, expr):
        return NOT(NOT(expr))

class NotNotElimination(OneInputRule):
    '''Rule for not not elimination'''
    rule_name = 'not_not_e'
    
    def can_apply(self, expr):
        return isinstance(expr, NOT) and isinstance(expr.expression, NOT)
    
    def apply(self, expr):
        return expr.expression.expression

class IffIntroductionLeft(TwoInputRule):
    '''Rule for iff introduction'''
    rule_name = 'iff_i'
    
    def can_apply(self, expr1, expr2):
        return isinstance(expr1, IMP) and isinstance(expr2, IMP) and expr1.left == expr2.right and expr1.right == expr2.left
    
    def apply(self, expr1, expr2):
        return IFF(expr1.left, expr1.right)

class IffIntroductionRight(TwoInputRule):
    '''Rule for iff introduction'''
    rule_name = 'iff_i'
    
    def can_apply(self, expr1, expr2):
        return isinstance(expr1, IMP) and isinstance(expr2, IMP) and expr1.left == expr2.right and expr1.right == expr2.left
    
    def apply(self, expr1, expr2):
        return IFF(expr2.left, expr2.right)

class IffEliminationLeft(OneInputRule):
    '''Rule for iff elimination'''
    rule_name = 'iff_e'
    
    def can_apply(self, expr):
        return isinstance(expr, IFF)
    
    def apply(self, expr):
        return IMP(expr.left, expr.right)

class IffEliminationRight(OneInputRule):
    '''Rule for iff elimination'''
    rule_name = 'iff_e'
    
    def can_apply(self, expr):
        return isinstance(expr, IFF)
    
    def apply(self, expr):
        return IMP(expr.right, expr.left)
    

rule_list = [
    AndIntroduction(),
    AndEliminationLeft(),
    AndEliminationRight(),
    OrIntroduction(),
    ImpliesElimination(),
    NotNotIntroduction(),
    NotNotElimination(),
    IffIntroductionLeft(),
    IffIntroductionRight(),
    IffEliminationLeft(),
    IffEliminationRight()
]
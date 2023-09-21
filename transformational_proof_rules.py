from logic import AND, OR, NOT, IMP, IFF, VAR

class Rule:
    '''Abstract class for a rule'''
    rule_name = None
    
    def can_apply(self, expr):
        raise NotImplementedError
    
    def apply(self, expr):
        raise NotImplementedError


class CommutativityAND(Rule):
    '''Commutativity for AND: (P^Q)⟺(Q^P)'''
    rule_name = "comm_assoc"
    
    def can_apply(self, expr):
        return isinstance(expr, AND)

    def apply(self, expr):
        return AND(expr.right, expr.left)

class CommutativityOR(Rule):
    '''Commutativity for OR: (PvQ)⟺(QvP)'''
    rule_name = "comm_assoc"
    
    def can_apply(self, expr):
        return isinstance(expr, OR)

    def apply(self, expr):
        return OR(expr.right, expr.left)
    
class CommutativityIFF(Rule):
    '''Commutativity for If and Only If: (P⟺Q)⟺(Q⟺P)''' 
    rule_name = "comm_assoc"
    
    def can_apply(self, expr):
        return isinstance(expr, IFF)

    def apply(self, expr):
        return IFF(expr.right, expr.left)

class CommutativityANDAND(Rule):
    '''Commutativity for AND: (P^Q)^R⟺Q^(P^R)'''
    rule_name = "comm_assoc"
    
    def can_apply(self, expr):
        return isinstance(expr, AND) and isinstance(expr.left, AND)

    def apply(self, expr):
        return AND(expr.left.right, AND(expr.left.left, expr.right))

class CommutativityOROR(Rule):
    '''Commutativity for OR: (PvQ)vR⟺Qv(PvR)'''
    rule_name = "comm_assoc"
    
    def can_apply(self, expr):
        return isinstance(expr, OR) and isinstance(expr.left, OR)

    def apply(self, expr):
        return OR(expr.left.right, OR(expr.left.left, expr.right))

class DoubleNegation(Rule):
    '''Double Negation: ¬(¬P)⟺P '''
    rule_name = "neg"
    
    def can_apply(self, expr):
        return isinstance(expr, NOT) and isinstance(expr.expression, NOT)

    def apply(self, expr):
        return expr.expression.expression

class ExcludedMiddle(Rule):
    '''Excluded Middle: Pv¬P⟺True'''
    rule_name = "lem"
    
    def can_apply(self, expr):
        # Check for an OR where one side is the negation of the other
        return isinstance(expr, OR) and ((isinstance(expr.right, NOT) and expr.left == expr.right.expression) or (isinstance(expr, OR) and isinstance(expr.left, NOT) and expr.right == expr.left.expression))

    def apply(self, expr):
        return True

class Contradiction(Rule):
    '''Contradiction: P∧¬P⟺False'''
    rule_name = "contr"

    def can_apply(self, expr):
        # Check for an AND where one side is the negation of the other
        return isinstance(expr, AND) and ((isinstance(expr.right, NOT) and expr.left == expr.right.expression) or (isinstance(expr, AND) and isinstance(expr.left, NOT) and expr.right == expr.left.expression))
    
    def apply(self, expr):
        return False
    
class DeMorganAND(Rule):
    '''De Morgans's Laws for AND: ¬(P∧Q)⟺(¬P)v(¬Q)'''
    rule_name = "dm"
    
    def can_apply(self, expr):
        return isinstance(expr, NOT) and isinstance(expr.expression, AND)

    def apply(self, expr):
        return OR(NOT(expr.expression.left), NOT(expr.expression.right))

class DeMorganOR(Rule):
    '''De Morgans's Laws for OR: ¬(PvQ)⟺(¬P)∧(¬Q)'''
    rule_name = "dm"
    
    def can_apply(self, expr):
        return isinstance(expr, NOT) and isinstance(expr.expression, OR)

    def apply(self, expr):
        return AND(NOT(expr.expression.left), NOT(expr.expression.right))

class DeMorganANDReverse(Rule):
    '''De Morgans's Laws for AND: (¬P)v(¬Q)⟺¬(P∧Q)'''
    rule_name = "dm"
    
    def can_apply(self, expr):
        return isinstance(expr, OR) and isinstance(expr.left, NOT) and isinstance(expr.right, NOT)

    def apply(self, expr):
        return NOT(AND(expr.left.expression, expr.right.expression))

class DeMorganORReverse(Rule):
    '''De Morgans's Laws for OR: (¬P)∧(¬Q)⟺¬(PvQ)'''
    rule_name = "dm"
    
    def can_apply(self, expr):
        return isinstance(expr, AND) and isinstance(expr.left, NOT) and isinstance(expr.right, NOT)

    def apply(self, expr):
        return NOT(OR(expr.left.expression, expr.right.expression))

class ImplicationElimination(Rule):
    '''Implication Elimination: (P⇒Q)⟺(¬P)vQ'''
    rule_name = "imp_elim"
    
    def can_apply(self, expr):
        return isinstance(expr, IMP)

    def apply(self, expr):
        return OR(NOT(expr.left), expr.right)

class ImplicationEliminationReverse(Rule):
    '''Implication Elimination: (¬P)vQ⟺(P⇒Q)'''
    rule_name = "imp_elim"
    
    def can_apply(self, expr):
        return isinstance(expr, OR) and isinstance(expr.left, NOT)

    def apply(self, expr):
        return IMP(expr.left.expression, expr.right)

class DistributivityAND(Rule):
    '''Distributivity for AND: P∧(QvR)⟺(P∧Q)v(P∧R)'''
    rule_name = "distr"
    
    def can_apply(self, expr):
        return isinstance(expr, AND) and isinstance(expr.right, OR)

    def apply(self, expr):
        return OR(AND(expr.left, expr.right.left), AND(expr.left, expr.right.right))

class DistributivityOR(Rule):
    '''Distributivity for OR: Pv(Q∧R)⟺(PvQ)∧(PvR)'''
    rule_name = "distr"
    
    def can_apply(self, expr):
        return isinstance(expr, OR) and isinstance(expr.right, AND)

    def apply(self, expr):
        return AND(OR(expr.left, expr.right.left), OR(expr.left, expr.right.right))

class DistributivityANDReverse(Rule):
    '''Distributivity for AND: (P∧Q)v(P∧R)⟺P∧(QvR)'''
    rule_name = "distr"
    
    def can_apply(self, expr):
        return isinstance(expr, OR) and isinstance(expr.left, AND) and isinstance(expr.right, AND) and expr.left.left == expr.right.left

    def apply(self, expr):
        return AND(expr.left.left, OR(expr.left.right, expr.right.right))

class DistributivityORReverse(Rule):
    '''Distributivity for OR: (PvQ)∧(PvR)⟺Pv(Q∧R)'''
    rule_name = "distr"
    
    def can_apply(self, expr):
        return isinstance(expr, AND) and isinstance(expr.left, OR) and isinstance(expr.right, OR) and expr.left.left == expr.right.left

    def apply(self, expr):
        return OR(expr.left.left, AND(expr.left.right, expr.right.right))

class Contrapositive(Rule):
    '''Contrapositive: (P⇒Q)⟺(¬Q⇒¬P)'''
    rule_name = "contrapos"
    
    def can_apply(self, expr):
        return isinstance(expr, IMP) and not(isinstance(expr.left, NOT) and isinstance(expr.right, NOT))

    def apply(self, expr):
        return IMP(NOT(expr.right), NOT(expr.left))

class Idempotence(Rule):
    '''Idempotence: P∧P⟺PvP⟺P'''
    rule_name = "idemp"
    
    def can_apply(self, expr):
        return (isinstance(expr, AND) or isinstance(expr, OR)) and expr.left == expr.right

    def apply(self, expr):
        return expr.left

class IdempotenceReverseOR(Rule):
    '''Idempotence: P⟺PvP'''
    rule_name = "idemp"
    
    def can_apply(self, expr):
        return not(isinstance(expr, AND) or isinstance(expr, OR) and expr.left == expr.right)

    def apply(self, expr):
        return OR(expr, expr)

class IdempotenceReverseAND(Rule):
    '''Idempotence: P⟺P∧P'''
    rule_name = "idemp"
    
    def can_apply(self, expr):
        return not(isinstance(expr, AND) or isinstance(expr, OR) and expr.left == expr.right)

    def apply(self, expr):
        return AND(expr, expr)

class Equivalence(Rule):
    '''Equivalence: P⟺Q⟺(P⇒Q)∧(Q⇒P)'''
    rule_name = "equiv"
    
    def can_apply(self, expr):
        return isinstance(expr, IFF)

    def apply(self, expr):
        return AND(IMP(expr.left, expr.right), IMP(expr.right, expr.left))

class EquivalenceReverse(Rule):
    '''Equivalence: (P⇒Q)∧(Q⇒P)⟺P⟺Q'''
    rule_name = "equiv"
    
    def can_apply(self, expr):
        return isinstance(expr, AND) and isinstance(expr.left, IMP) and isinstance(expr.right, IMP) and expr.left.left == expr.right.right and expr.left.right == expr.right.left

    def apply(self, expr):
        return IFF(expr.left.left, expr.left.right)

class Simplification1Var(Rule):
    '''Simplification1: P∧True ⟺ PvFalse ⟺ P'''
    rule_name = "simp1"
    
    def can_apply(self, expr):
        return (isinstance(expr, AND) and (expr.left == True or expr.right == True)) or (isinstance(expr, OR) and (expr.left == False or expr.right == False))
    
    def apply(self, expr):
        if isinstance(expr, AND):
            if expr.left == True:
                return expr.right
            else:
                return expr.left
        else:
            if expr.left == False:
                return expr.right
            else:
                return expr.left

class Simplification1AndReverse(Rule):
    '''Simplification1: P ⟺ P∧True'''
    rule_name = "simp1"
    
    def can_apply(self, expr):
        return not(isinstance(expr, AND) or isinstance(expr, OR) and (expr.left == True or expr.right == True))
    
    def apply(self, expr):
        return AND(expr, True)

class Simplification1OrReverse(Rule):
    '''Simplification1: P ⟺ PvFalse'''
    rule_name = "simp1"
    
    def can_apply(self, expr):
        return not(isinstance(expr, AND) or isinstance(expr, OR) and (expr.left == True or expr.right == True))
    
    def apply(self, expr):
        return OR(expr, False)

class Simplification1True(Rule):
    '''Simplification1: PvTrue ⟺ True'''
    rule_name = "simp1"
    
    def can_apply(self, expr):
        return isinstance(expr, OR) and (expr.left == True or expr.right == True)
    
    def apply(self, expr):
        return True

class Simplification1False(Rule):
    '''Simplification1: P∧False ⟺ False'''
    rule_name = "simp1"
    
    def can_apply(self, expr):
        return isinstance(expr, AND) and (expr.left == False or expr.right == False)
    
    def apply(self, expr):
        return False

class Simplification2Or(Rule):
    '''Simplification2: Pv(P∧Q) ⟺ P'''
    rule_name = "simp2"
    
    def can_apply(self, expr):
        return isinstance(expr, OR) and ((isinstance(expr.right, AND) and (expr.left == expr.right.left or expr.left == expr.right.right)) or (isinstance(expr.left, AND) and (expr.right == expr.left.left or expr.right == expr.left.right)))
    
    def apply(self, expr):
        if isinstance(expr.right, AND):
            if expr.left == expr.right.left:
                return expr.left
            else:
                return expr.right.right
        else:
            if expr.right == expr.left.left:
                return expr.right
            else:
                return expr.left.right

class Simplification2And(Rule):
    '''Simplification2: P∧(PvQ) ⟺ P'''
    rule_name = "simp2"
    
    def can_apply(self, expr):
        return isinstance(expr, AND) and ((isinstance(expr.right, OR) and (expr.left == expr.right.left or expr.left == expr.right.right)) or (isinstance(expr.left, OR) and (expr.right == expr.left.left or expr.right == expr.left.right)))
    
    def apply(self, expr):
        if isinstance(expr.right, OR):
            if expr.left == expr.right.left:
                return expr.left
            else:
                return expr.right.right
        else:
            if expr.right == expr.left.left:
                return expr.right
            else:
                return expr.left.right
    



rules_list = [
    CommutativityAND(),
    CommutativityOR(),
    CommutativityIFF(),
    CommutativityANDAND(),
    CommutativityOROR(),
    DoubleNegation(),
    ExcludedMiddle(),
    Contradiction(),
    DeMorganAND(),
    DeMorganOR(),
    DeMorganANDReverse(),
    DeMorganORReverse(),
    ImplicationElimination(),
    ImplicationEliminationReverse(),
    DistributivityAND(),
    DistributivityOR(),
    DistributivityANDReverse(),
    DistributivityORReverse(),
    Contrapositive(),
    Idempotence(),
    Equivalence(),
    EquivalenceReverse(),
    Simplification1Var(),
    Simplification1True(),
    Simplification1False(),
    Simplification2Or(),
    Simplification2And()
]


if __name__ == "__main__":
    expr = AND(VAR("P"), VAR("Q"))
    comm_rule = CommutativityAND()
    if comm_rule.can_apply(expr):
        new_expr = comm_rule.apply(expr)
        print(new_expr)

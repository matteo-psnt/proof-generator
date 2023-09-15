from logic import AND, OR, NOT, IMPLIES, IFF, Variable

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

class ImplicationElimination(Rule):
    '''Implication Elimination: (P⇒Q)⟺(¬P)vQ'''
    rule_name = "imp_elim"
    
    def can_apply(self, expr):
        return isinstance(expr, IMPLIES)

    def apply(self, expr):
        return OR(NOT(expr.left), expr.right)

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

class Idempotence(Rule):
    '''Idempotence: P∧P⟺PvP⟺P'''
    rule_name = "idemp"
    
    def can_apply(self, expr):
        return expr.left == expr.right and (isinstance(expr, AND) or isinstance(expr, OR))

    def apply(self, expr):
        return expr.left

class Equivalence(Rule):
    '''Equivalence: P⟺Q⟺(P⇒Q)∧(Q⇒P)'''
    rule_name = "equiv"
    
    def can_apply(self, expr):
        return isinstance(expr, IFF)

    def apply(self, expr):
        return AND(IMPLIES(expr.left, expr.right), IMPLIES(expr.right, expr.left))

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
    

# To use
expr = AND(Variable("P"), Variable("Q"))
comm_rule = CommutativityAND()
if comm_rule.can_apply(expr):
    new_expr = comm_rule.apply(expr)
    print(new_expr)

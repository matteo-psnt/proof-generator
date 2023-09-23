import unittest
from context import AND, OR, NOT, IMP, IFF, VAR
from context import (
    CommutativityAND,
    CommutativityOR,
    CommutativityIFF,
    DoubleNegation,
    ExcludedMiddle,
    Contradiction,
    DeMorganAND,
    DeMorganOR,
    ImplicationElimination,
    DistributivityAND,
    DistributivityOR,
    Idempotence,
    Equivalence,
    Simplification1Var,
    Simplification1True,
    Simplification1False,
    Simplification2Or,
    Simplification2And
)



class LogicRulesTests(unittest.TestCase):
    def setUp(self):
        self.P = VAR("P")
        self.Q = VAR("Q")
        self.R = VAR("R")
    
    def test_AND_commutativity(self):
        rule = CommutativityAND()
        expr = AND(self.P, self.Q)
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), AND(self.Q, self.P))
        
    def test_OR_commutativity(self):
        rule = CommutativityOR()
        expr = OR(self.P, self.Q)
        self.assertTrue(rule.can_apply(expr))
        changed_expr = rule.apply(expr)
        self.assertEqual(changed_expr, OR(self.Q, self.P))
        
    def test_IFF_commutativity(self):
        rule = CommutativityIFF()
        expr = IFF(self.P, self.Q)
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), IFF(self.Q, self.P))
        
    def test_elimination_of_double_negation(self):
        rule = DoubleNegation()
        expr = NOT(NOT(self.P))
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), self.P)
        
    def test_validation_of_excluded_middle(self):
        rule = ExcludedMiddle()
        expr = OR(self.P, NOT(self.P))
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), True)
        
    def test_identification_of_contradiction(self):
        rule = Contradiction()
        expr = AND(self.P, NOT(self.P))
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), False)

    def test_AND_DeMorgans_law(self):
        rule = DeMorganAND()
        expr = NOT(AND(self.P, self.Q))
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), OR(NOT(self.P), NOT(self.Q)))

    def test_OR_DeMorgans_law(self):
        rule = DeMorganOR()
        expr = NOT(OR(self.P, self.Q))
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), AND(NOT(self.P), NOT(self.Q)))

    def test_implication_to_OR_conversion(self):
        rule = ImplicationElimination()
        expr = IMP(self.P, self.Q)
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), OR(NOT(self.P), self.Q))

    def test_AND_distributivity_over_OR(self):
        rule = DistributivityAND()
        expr = AND(self.P, OR(self.Q, self.R))
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), OR(AND(self.P, self.Q), AND(self.P, self.R)))

    def test_OR_distributivity_over_AND(self):
        rule = DistributivityOR()
        expr = OR(self.P, AND(self.Q, self.R))
        self.assertTrue(rule.can_apply(expr))
        self.assertEqual(rule.apply(expr), AND(OR(self.P, self.Q), OR(self.P, self.R)))

    def test_identification_of_idempotent_laws(self):
        rule = Idempotence()
        expr1 = AND(self.P, self.P)
        expr2 = OR(self.P, self.P)
        self.assertTrue(rule.can_apply(expr1))
        self.assertTrue(rule.can_apply(expr2))
        self.assertEqual(rule.apply(expr1), self.P)
        self.assertEqual(rule.apply(expr2), self.P)


if __name__ == "__main__":
    unittest.main()

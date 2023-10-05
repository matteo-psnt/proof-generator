import unittest
from context import AND, OR, NOT, IMP, IFF, VAR

class TestLogicOperations(unittest.TestCase):
    def setUp(self):
        self.assignment = {
            'A': True,
            'B': False,
            'C': True,
            'D': False,
        }

    def test_not(self):
        expr = NOT(VAR('A'))
        self.assertEqual(expr.evaluate(self.assignment), False)
        expr = NOT(VAR('B'))
        self.assertEqual(expr.evaluate(self.assignment), True)
        self.assertEqual(str(expr), "(!B)")
        self.assertEqual(repr(expr), "NOT(VAR(B))")

    def test_and(self):
        expr = AND(VAR('A'), VAR('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)
        expr = AND(VAR('A'), VAR('B'))
        self.assertEqual(expr.evaluate(self.assignment), False)
        self.assertEqual(str(expr), "(A & B)")
        self.assertEqual(repr(expr), "AND(VAR(A), VAR(B))")

    def test_or(self):
        expr = OR(VAR('B'), VAR('D'))
        self.assertEqual(expr.evaluate(self.assignment), False)
        expr = OR(VAR('A'), VAR('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)
        self.assertEqual(str(expr), "(A | C)")
        self.assertEqual(repr(expr), "OR(VAR(A), VAR(C))")

    def test_implies(self):
        expr = IMP(VAR('A'), VAR('B'))
        self.assertEqual(expr.evaluate(self.assignment), False)
        expr = IMP(VAR('B'), VAR('A'))
        self.assertEqual(expr.evaluate(self.assignment), True)
        expr = IMP(VAR('A'), VAR('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)
        self.assertEqual(str(expr), "(A => C)")
        self.assertEqual(repr(expr), "IMP(VAR(A), VAR(C))")

    def test_iff(self):
        expr = IFF(VAR('A'), VAR('B'))
        self.assertEqual(expr.evaluate(self.assignment), False)
        expr = IFF(VAR('B'), VAR('D'))
        self.assertEqual(expr.evaluate(self.assignment), True)
        expr = IFF(VAR('A'), VAR('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)
        self.assertEqual(str(expr), "(A <=> C)")
        self.assertEqual(repr(expr), "IFF(VAR(A), VAR(C))")

    def test_variable(self):
        var = VAR('A')
        self.assertEqual(var.evaluate(self.assignment), True)
        var = VAR('B')
        self.assertEqual(var.evaluate(self.assignment), False)
        self.assertEqual(str(var), "B")
        self.assertEqual(repr(var), "VAR(B)")

    def test_nested_expressions(self):
        expr = OR(AND(VAR('A'), VAR('B')), NOT(VAR('C')))
        self.assertEqual(expr.evaluate(self.assignment), False)
        self.assertEqual(str(expr), "((A & B) | (!C))")
        self.assertEqual(repr(expr), "OR(AND(VAR(A), VAR(B)), NOT(VAR(C)))")

    def test_len_method(self):
        expr = AND(VAR('A'), VAR('B'))
        self.assertEqual(len(expr), 3)

if __name__ == '__main__':
    unittest.main()

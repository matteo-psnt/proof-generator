import unittest
from context import AND, OR, NOT, IMPLIES, IFF, Variable

class TestLogicOperations(unittest.TestCase):
    def setUp(self):
        self.assignment = {
            'A': True,
            'B': False,
            'C': True,
        }

    def test_not(self):
        expr = NOT(Variable('A'))
        self.assertEqual(expr.evaluate(self.assignment), False)

    def test_and(self):
        expr = AND(Variable('A'), Variable('B'))
        self.assertEqual(expr.evaluate(self.assignment), False)

    def test_or(self):
        expr = OR(Variable('A'), Variable('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)

    def test_implies(self):
        expr = IMPLIES(Variable('A'), Variable('B'))
        self.assertEqual(expr.evaluate(self.assignment), False)

    def test_iff(self):
        expr = IFF(Variable('A'), Variable('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)

    def test_variable(self):
        var = Variable('B')
        self.assertEqual(var.evaluate(self.assignment), False)


if __name__ == '__main__':
    unittest.main()



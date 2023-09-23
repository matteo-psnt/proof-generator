import unittest
from context import AND, OR, NOT, IMP, IFF, VAR

class TestLogicOperations(unittest.TestCase):
    def setUp(self):
        self.assignment = {
            'A': True,
            'B': False,
            'C': True,
        }

    def test_not(self):
        expr = NOT(VAR('A'))
        self.assertEqual(expr.evaluate(self.assignment), False)

    def test_and(self):
        expr = AND(VAR('A'), VAR('B'))
        self.assertEqual(expr.evaluate(self.assignment), False)

    def test_or(self):
        expr = OR(VAR('A'), VAR('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)

    def test_implies(self):
        expr = IMP(VAR('A'), VAR('B'))
        self.assertEqual(expr.evaluate(self.assignment), False)
        
        expr = IMP(VAR('B'), VAR('A'))
        self.assertEqual(expr.evaluate(self.assignment), False)
        
        expr = IMP(VAR('A'), VAR('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)

    def test_iff(self):
        expr = IFF(VAR('A'), VAR('C'))
        self.assertEqual(expr.evaluate(self.assignment), True)

    def test_variable(self):
        var = VAR('B')
        self.assertEqual(var.evaluate(self.assignment), False)


if __name__ == '__main__':
    unittest.main()



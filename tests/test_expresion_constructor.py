import unittest
from context import AND, OR, NOT, IMP, IFF, VAR
from context import parse_bool_expression
from context import construct_ast

class TestBooleanParser(unittest.TestCase):

    def test_parse_bool_expression(self):
        self.assertEqual(parse_bool_expression("(a & b) | c"), ['(', 'a', '&', 'b', ')', '|', 'c'])

    def test_construct_ast(self):
        tokens = parse_bool_expression("(a & b) | c")
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, OR)
        self.assertIsInstance(ast.left, AND)
        self.assertIsInstance(ast.right, VAR)
        self.assertEqual(ast.left.left.value, "a")
        self.assertEqual(ast.left.right.value, "b")
        self.assertEqual(ast.right.value, "c")

    def test_unbalanced_parentheses(self):
        tokens = parse_bool_expression("(a & b | c")
        with self.assertRaises(ValueError) as context:
            construct_ast(tokens)
        self.assertTrue("Unbalanced parentheses" in str(context.exception))

    def test_empty_expression(self):
        with self.assertRaises(ValueError) as context:
            construct_ast([])
        self.assertTrue("Expression cannot be empty" in str(context.exception))

    def test_single_variable(self):
        tokens = parse_bool_expression("a")
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, VAR)
        self.assertEqual(ast.value, "a")

    def test_not_operation(self):
        tokens = parse_bool_expression("!a")
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, NOT)
        self.assertEqual(ast.expression.value, "a")

if __name__ == "__main__":
    unittest.main()

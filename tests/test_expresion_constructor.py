import unittest
from context import AND, OR, NOT, IMP, IFF, VAR
from context import construct_ast


class TestConstructAST(unittest.TestCase):
    def test_construct_ast(self):
        tokens = ['(', 'a', '&', 'b', ')', '|', 'c']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, OR)
        self.assertIsInstance(ast.left, AND)
        self.assertIsInstance(ast.right, VAR)
        self.assertEqual(ast.left.left.name, "a")
        self.assertEqual(ast.left.right.name, "b")
        self.assertEqual(ast.right.name, "c")

    def test_unbalanced_parentheses(self):
        tokens = ['(', 'a', '&', 'b', '|', 'c']
        with self.assertRaises(ValueError) as context:
            construct_ast(tokens)
        self.assertTrue("Unbalanced parentheses" in str(context.exception))

    def test_empty_expression(self):
        with self.assertRaises(ValueError) as context:
            construct_ast([])
        self.assertTrue("Expression cannot be empty" in str(context.exception))

    def test_single_variable(self):
        tokens = ['a']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, VAR)
        self.assertEqual(ast.name, "a")

    def test_not_operation(self):
        tokens = ['!', 'a']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, NOT)
        self.assertEqual(ast.expression.name, "a")
    
    def test_not_operation_with_parentheses(self):
        tokens = ['!', '(', 'a', '&', 'b', ')']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, NOT)
        self.assertIsInstance(ast.expression, AND)
        self.assertEqual(ast.expression.left.name, "a")
        self.assertEqual(ast.expression.right.name, "b")
    
    def test_not_operation_with_not_operation(self):
        tokens = ['!', '!', 'a']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, NOT)
        self.assertIsInstance(ast.expression, NOT)
        self.assertEqual(ast.expression.expression.name, "a")
    
    def test_true(self):
        tokens = ['true']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, bool)
    
    def test_false(self):
        tokens = ['false']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, bool)
    
    def test_boolean_operation(self):
        tokens = ['true', '&', 'false']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, AND)
        self.assertIsInstance(ast.left, bool)
        self.assertIsInstance(ast.right, bool)
        self.assertEqual(ast.left, True)
        self.assertEqual(ast.right, False)
    
    def test_boolean_operation_with_parentheses(self):
        tokens = ['(', 'true', '&', 'false', ')']
        ast = construct_ast(tokens)
        self.assertIsInstance(ast, AND)
        self.assertIsInstance(ast.left, bool)
        self.assertIsInstance(ast.right, bool)
        self.assertEqual(ast.left, True)
        self.assertEqual(ast.right, False)
        

if __name__ == "__main__":
    unittest.main()

import unittest
from context import parse_bool_expression, add_parentheses

class TestParseBoolExpression(unittest.TestCase):

    def test_parse_bool_expression(self):
        self.assertEqual(parse_bool_expression("(a & b) | c"), ['(', 'a', '&', 'b', ')', '|', 'c'])
    
    def test_parse_bool_expression_with_spaces(self):
        self.assertEqual(parse_bool_expression("( a & b ) | c"), ['(', 'a', '&', 'b', ')', '|', 'c'])
    
    def test_parse_bool_expression_with_not(self):
        self.assertEqual(parse_bool_expression("!(a & b) | c"), ['!', '(', 'a', '&', 'b', ')', '|', 'c'])
    
    def test_parse_bool_expression_with_true(self):
        self.assertEqual(parse_bool_expression("true & b"), ['true', '&', 'b'])
    
    def test_parse_bool_expression_with_false(self):
        self.assertEqual(parse_bool_expression("false & b"), ['false', '&', 'b'])
    
    def test_parse_bool_expression_with_implication(self):
        self.assertEqual(parse_bool_expression("a => b"), ['a', '=>', 'b'])
    
    def test_parse_bool_expression_with_equivalence(self):
        self.assertEqual(parse_bool_expression("a <=> b"), ['a', '<=>', 'b'])
    
    def test_parse_bool_expression_with_parentheses(self):
        self.assertEqual(parse_bool_expression("a & (b | c)"), ['a', '&', '(', 'b', '|', 'c', ')'])

    def test_basic(self):
        self.assertEqual(parse_bool_expression('T and F or not TRUE'), ['true', '&', 'false', '|', '!', 'true'])
        
    def test_standard_delimiters(self):
        self.assertEqual(parse_bool_expression('true & false | !true'), ['true', '&', 'false', '|', '!', 'true'])
        
    def test_non_standard_delimiters(self):
        self.assertEqual(parse_bool_expression('T ^ F ∨ ¬TRUE'), ['true', '&', 'false', '|', '!', 'true'])
        
    def test_numeric(self):
        self.assertEqual(parse_bool_expression('1 and 0 or not 1'), ['true', '&', 'false', '|', '!', 'true'])
        
    def test_empty_expression(self):
        self.assertEqual(parse_bool_expression(''), [])
        
    def test_parentheses(self):
        self.assertEqual(parse_bool_expression('(T and F) or true'), ['(', 'true', '&', 'false', ')', '|', 'true'])

    def test_redundant_symbols(self):
        self.assertEqual(parse_bool_expression('T && F || not T'), ['true', '&', 'false', '|', '!', 'true'])
        
    def test_exotic_delimiters(self):
        self.assertEqual(parse_bool_expression('T ^ F v ~T'), ['true', '&', 'false', '|', '!', 'true'])
        
    def test_english_words(self):
        self.assertEqual(parse_bool_expression('true and not false or true'), ['true', '&', '!', 'false', '|', 'true'])
    
    def test_english_words_with_parentheses(self):
        self.assertEqual(parse_bool_expression('true and (not false or true)'), ['true', '&', '(', '!', 'false', '|', 'true', ')'])
    
    def test_english_words_with_parentheses_and_spaces(self):
        self.assertEqual(parse_bool_expression('true and ( not false or true )'), ['true', '&', '(', '!', 'false', '|', 'true', ')'])

class TestAddParentheses(unittest.TestCase):

    def test_basic_expression(self):
        tokens = ['A', '&', 'B', '|', 'C', '=>', 'D', '<=>', 'E']
        expected = ['(', '(', '(', '(', 'A', '&', 'B', ')', '|', 'C', ')', '=>', 'D', ')', '<=>', 'E', ')']
        result = add_parentheses(tokens)
        self.assertEqual(result, expected)

    def test_negation(self):
        tokens = ['!', 'A', '&', 'B']
        expected = ['(', '(', '!', 'A', ')', '&', 'B', ')']
        result = add_parentheses(tokens)
        self.assertEqual(result, expected)

    def test_unbalanced_parentheses(self):
        tokens = ['(', 'A', '&', 'B']
        with self.assertRaises(ValueError):
            add_parentheses(tokens)

    def test_empty_expression(self):
        tokens = []
        with self.assertRaises(ValueError):
            add_parentheses(tokens)
    
    def test_associativity(self):
        tokens = ['A', '&', 'B', '&', 'C']
        expected = ['(', 'A', '&', '(', 'B', '&', 'C', ')', ')']
        result = add_parentheses(tokens)
        self.assertEqual(result, expected)
    
    def test_associativity2(self):
        tokens = ['A', '|', 'B', '|', 'C']
        expected = ['(', 'A', '|', '(', 'B', '|', 'C', ')', ')']
        result = add_parentheses(tokens)
        self.assertEqual(result, expected)
    
    def test_order_of_operations(self):
        tokens = ['A', '&', 'B', '|', 'C']
        expected = ['(', '(', 'A', '&', 'B', ')', '|', 'C', ')']
        result = add_parentheses(tokens)
        self.assertEqual(result, expected)
    

if __name__ == "__main__":
    unittest.main()

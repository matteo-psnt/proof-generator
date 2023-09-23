import re

def parse_bool_expression(expression):
    """Parse a boolean expression and return a list of boolean values."""
    delimiters = ['!', '&', '|', '<=>', '=>', '(', ')']
    
    pattern_str = '({})'.format('|'.join(re.escape(d) for d in delimiters))
    
    pattern = re.compile(pattern_str)
    
    return [item.strip() for item in re.split(pattern, expression) if item.strip()]


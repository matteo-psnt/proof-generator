import re

def parse_bool_expression(expression):
    """Parse a boolean expression and return a list of boolean values."""
    delimiters = ['!', '&', '|', '<=>', '=>', '(', ')']
    
    pattern_str = '({})'.format('|'.join(re.escape(d) for d in delimiters))
    
    # Define a regular expression pattern
    pattern = re.compile(pattern_str)
    
    # Split the string based on the pattern and strip unnecessary spaces
    return [item.strip() for item in re.split(pattern, expression) if item.strip()]

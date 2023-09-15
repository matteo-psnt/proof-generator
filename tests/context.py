import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from logic import AND, OR, NOT, IMPLIES, IFF, Variable
from proof_rules import CommutativityAND, CommutativityOR, CommutativityIFF, DoubleNegation, ExcludedMiddle, Contradiction, DeMorganAND, DeMorganOR, ImplicationElimination, DistributivityAND, DistributivityOR, Idempotence


if __name__ == '__main__':
    print(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
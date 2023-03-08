#!/usr/bin/env python3

import json
import sys

def err(*a, **aa):
	print(*a, file=sys.stderr, **aa)

# load pandoc document tree
doc = json.loads(''.join([*sys.stdin]))

err(json.dumps())

json.dumps(doc)
err(json.dumps(doc))
print(json.dumps(doc))
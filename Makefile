# Define the paths for Python and pip
PYTHON = reflect/bin/python3
PIP = reflect/bin/pip3

# Default target
default: run

# Define aliases
run:
	$(PYTHON) $(CMD)

test:
	$(PYTHON) recognition/testAPI.py

pip:
	$(PIP) ${CMD}
# Makefile for Golem Network Certificate Manager

# Phony targets (targets that don't represent files)
.PHONY: all clean setup gen-keys root-cert sign-root user-cert sign-user node-desc sign-node

# Default target
all: setup

# Setup process
setup: gen-keys root-cert sign-root user-cert sign-user node-desc sign-node

# Generate key pairs
gen-keys:
	@echo "Generating key pairs..."
	node ./scripts/genkeys.mjs

# Create root certificate
root-cert: gen-keys
	@echo "Creating root certificate..."
	node ./scripts/createRootCert.mjs

# Sign root certificate
sign-root: root-cert
	@echo "Signing root certificate..."
	node ./scripts/signRootSelfCert.mjs

# Create user certificate
user-cert: sign-root
	@echo "Creating user certificate..."
	node ./scripts/createUserCert.mjs

# Sign user certificate
sign-user: user-cert
	@echo "Signing user certificate..."
	node ./scripts/signUserCert.mjs

# Create node descriptor
node-desc: sign-user
	@echo "Creating node descriptor..."
	node ./scripts/createNodeDesc.mjs

# Sign node descriptor
sign-node: node-desc
	@echo "Signing node descriptor..."
	node ./scripts/signNodeDesc.mjs

# Clean up generated files
clean:
	@echo "Cleaning up generated files..."
	node ./scripts/cleanup.mjs

# Error handling
%:
	@echo "Error: Target $@ not found."
	@echo "Available targets: all, setup, gen-keys, root-cert, sign-root, user-cert, sign-user, node-desc, sign-node, clean"
	@exit 1
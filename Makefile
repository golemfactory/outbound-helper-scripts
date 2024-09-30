# Makefile for certificate generation process

# Phony targets (targets that don't represent files)
.PHONY: all clean gen-keys root-cert sign-root user-cert sign-user node-desc sign-node validate

# Default target
all: gen-keys root-cert sign-root user-cert sign-user node-desc sign-node validate

# Generate key pairs
gen-keys:
	@echo "Generating key pairs..."
	node genkeys.mjs

# Create root certificate
root-cert: gen-keys
	@echo "Creating root certificate..."
	node createRootCert.mjs

# Sign root certificate
sign-root: root-cert
	@echo "Signing root certificate..."
	node signRootSelfCert.mjs

# Create user certificate
user-cert: sign-root
	@echo "Creating user certificate..."
	node createUserCert.mjs

# Sign user certificate
sign-user: user-cert
	@echo "Signing user certificate..."
	node signUserCert.mjs

# Create node descriptor
node-desc: sign-user
	@echo "Creating node descriptor..."
	node createNodeDesc.mjs

# Sign node descriptor
sign-node: node-desc
	@echo "Signing node descriptor..."
	node signNodeDesc.mjs

# Validate certificates and node descriptors
validate: sign-node
	@echo "Validating certificates and node descriptors..."
	node validator.mjs

# Clean up generated files (optional, customize as needed)
clean:
	@echo "Cleaning up generated files..."
	rm -f intm/*.json root/*.json user/*.json

# Error handling
%:
	@echo "Error: Target $@ not found."
	@echo "Available targets: all, gen-keys, root-cert, sign-root, user-cert, sign-user, node-desc, sign-node, validate, clean"
	@exit 1

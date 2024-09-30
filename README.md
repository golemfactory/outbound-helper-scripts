# Golem Network Certificate and Node Descriptor Management

This project provides tools for managing certificates and node descriptors in the Golem Network. The process involves creating and signing certificates, as well as generating and signing node descriptors.

## Key Concepts

1. **Root Certificate**: A self-signed certificate that serves as the trust anchor. It's used to validate requestors' signed payloads and verify their trustworthiness.

2. **User Certificate**: A certificate issued to users (requestors), signed by the root certificate.

3. **Node Descriptor**: A JSON file containing the requestor's nodeID and the URLs they wish to access.

## Process Overview

1. Generate root certificate
2. Generate user certificate
3. Sign user certificate with root certificate
4. Generate node descriptor
5. Sign node descriptor using user certificate
6. Attach the signed node descriptor to the requestor script for task requests on the Golem Network

## Implementation

The process is implemented using several JavaScript files:

1. `genkeys.mjs`: Generates key pairs for root, intermediate, and user certificates.
2. `createRootCert.mjs`: Creates the root certificate.
3. `signRootSelfCert.mjs`: Signs the root certificate.
4. `createUserCert.mjs`: Creates the user certificate.
5. `signUserCert.mjs`: Signs the user certificate with the root certificate.
6. `createNodeDesc.mjs`: Generates the node descriptor.
7. `signNodeDesc.mjs`: Signs the node descriptor using the user certificate.
8. `validator.mjs`: Validates certificates and node descriptors.

## Usage

To set up the certificates and node descriptor:

1. Run `genkeys.mjs` to generate key pairs.
2. Execute the scripts in the order listed above (createRootCert.mjs, signRootSelfCert.mjs, etc.).
3. Use the `validator.mjs` script to verify the validity of certificates and node descriptors.

For detailed implementation, refer to the individual script files in the project.

## Important Notes

- Ensure that the root certificate is securely stored and distributed to providers for validating incoming requests.
- Keep private keys secure and never share them.
- The signed node descriptor must be attached to the requestor script when submitting tasks to the Golem Network.
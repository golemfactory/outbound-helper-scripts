# Golem Network Certificate and Node Descriptor Manager

This project simplifies the process of creating and managing certificates and node descriptors for the Golem Network. It provides an easy-to-use set of tools for developers to generate, sign, and validate certificates and node descriptors.

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Modify the configuration (see Configuration section below)
4. Run the setup script: `npm run setup`

This will automatically generate keys, create and sign certificates, and create and sign the node descriptor based on your configuration.

## Configuration

Before running the setup, it's crucial to modify the `config.mjs` file to suit your needs. This file contains important settings that will be used throughout the certificate and node descriptor creation process.

## Certificate and Node Descriptor Structures

The certificate and node descriptor structures used in this project follow specific schemas defined by the Golem Network. For a complete understanding of all possible fields and their descriptions, please refer to the official schema documentation:

- [Certificate Schema](https://schemas.golem.network/v1/certificate.schema.json)
- [Node Descriptor Schema](https://schemas.golem.network/v1/node-descriptor.schema.json)

When configuring your certificates and node descriptors in `config.mjs`, you can include additional fields as needed, based on the full schema definitions linked above. The configuration provided in `config.mjs` represents commonly used fields but is not exhaustive.


### Key Components of `config.mjs`:

1. `directories`: Defines the directory structure for keys, certificates, and node descriptors.
   - Modify these if you want to change where files are stored.

2. `templateFiles`: Specifies the paths to template files used for certificate and key generation.
   - You generally don't need to modify these unless you're changing the template structure.

3. `outputFiles`: Defines the names of output files for certificates and node descriptors.
   - Modify these if you want different filenames for the generated certificates and descriptors.

4. `certConfig`: Contains configuration for certificates. Key areas to review:
   - `validityPeriod`: Set the validity periods for root, user, and node certificates.
   - `keyUsage`: Define the permitted uses for root and user certificates.
   - `permissions`: Set the permissions for root and user certificates.
   - `subject`: Configure the subject information for root and user certificates.

5. `nodeDescriptorConfig`: Specifies the node ID and permissions for the node descriptor.
   - `nodeId`: Set this to your specific node ID.
   - `permissions`: Configure the outbound URL permissions for your node.

### Example of modifying `config.mjs`:

```javascript
export const certConfig = {
  validityPeriod: {
    root: 6, // Changed from 3 to 6 months
    user: 3, // Changed from 2 to 3 months
    node: 1,
  },
  // ... other config options ...
};

export const nodeDescriptorConfig = {
  nodeId: '0xYOUR_NODE_ID_HERE', // Replace with your actual node ID
  permissions: {
    outbound: {
      urls: ['https://your-allowed-url.com'], // Add your allowed URLs
    },
  },
};
```

Make sure to review and modify these settings according to your specific requirements before running the setup.

## Detailed Guide

### Project Structure

- `config.mjs`: Contains configuration settings for directories, file paths, and certificate properties.
- `genkeys.mjs`: Generates key pairs for root, intermediate, and user certificates.
- `createRootCert.mjs`: Creates the root certificate.
- `signRootSelfCert.mjs`: Signs the root certificate.
- `createUserCert.mjs`: Creates the user certificate.
- `signUserCert.mjs`: Signs the user certificate with the root certificate.
- `createNodeDesc.mjs`: Generates the node descriptor.
- `signNodeDesc.mjs`: Signs the node descriptor using the user certificate.

### Setup Process

The setup process is automated using npm scripts defined in `package.json`. To run the entire setup:

```bash
npm run setup
```

This command will execute the following steps in order:

1. Generate keys
2. Create root certificate
3. Sign root certificate
4. Create user certificate
5. Sign user certificate
6. Create node descriptor
7. Sign node descriptor

You can also run these steps individually using the following commands:

```bash
npm run genkeys
npm run create-root-cert
npm run sign-root-cert
npm run create-user-cert
npm run sign-user-cert
npm run create-node-desc
npm run sign-node-desc
```


### Customization

To customize the certificates or node descriptor:

1. Edit the relevant configuration in `config.mjs`.
2. Run the setup process again or run individual scripts as needed.

### Cleanup

To remove all generated files and directories, use the cleanup script:

```bash
npm run cleanup
```

This will delete all keys, certificates, node descriptors, and other generated files, allowing you to start fresh or regenerate everything.


## Important Notes

- Ensure that the root certificate is securely stored and distributed to providers for validating incoming requests.
- Keep private keys secure and never share them.
- If the provider is using the outbound in partner mode, the signed node descriptor must be attached to the requestor script when submitting tasks to the Golem Network before it'll accept it.

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed: `npm install`
2. Check that the directory structure matches the configuration in `config.mjs`
3. Verify that you have the necessary permissions to read/write in the project directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

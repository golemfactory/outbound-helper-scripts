import path from 'path';

const BASE_PATH = process.env.GOLEM_BASE_PATH || path.resolve('.');

export const directories = {
  keys: path.join(BASE_PATH, 'keys'),
  certificates: {
    root: path.join(BASE_PATH, 'certificates', 'root'),
    user: path.join(BASE_PATH, 'certificates', 'user'),
    intermediate: path.join(BASE_PATH, 'certificates', 'intermediate'),
  },
  nodeDescriptors: path.join(BASE_PATH, 'node-descriptors'),
  templates: path.join(BASE_PATH, 'templates'),
  certificatesDir: path.join(BASE_PATH, 'certificates'),
};

export const templateFiles = {
  certificate: path.join(directories.templates, 'certificate.template.json'),
  key: path.join(directories.templates, 'key.template.json'),
  signature: path.join(directories.templates, 'signature.template.json'),
  nodeDescriptor: path.join(directories.templates, 'node_descriptor.template.json'),
};

export const outputFiles = {
  rootSelfCert: 'root_self_cert.json',
  rootSelfCertSigned: 'root_self_cert.signed.json',
  userCert: 'user_cert.json',
  userCertSigned: 'user_cert.signed.json',
  nodeDescriptor: 'node_descriptor.json',
  nodeDescriptorSigned: 'node_descriptor.signed.json',
};

export const certConfig = {
  validityPeriod: {
    root: 3, // months
    user: 2, // months
    node: 1, // months
  },
  keyUsage: {
    root: 'all',
    user: ['signNode'],
  },
  permissions: {
    root: 'all',
    user: {
      outbound: {
        urls: ['https://ipfs.io'],
      },
    },
  },
  subject: {
    root: {
      displayName: 'Crypd',
      contact: {
        email: 'crypd@somedomain.com',
      },
    },
    user: {
      displayName: 'Requestor 1',
      contact: {
        email: 'Requestor@OnGolem.network',
      },
    },
  },
};

export const nodeDescriptorConfig = {
  nodeId: '0xb605b8e1afa10179fc27a06f0c9ba9a226f39a50',
  permissions: {
    outbound: {
      urls: ['https://ipfs.io'],
    },
  },
};
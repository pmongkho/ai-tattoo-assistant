
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 16791, hash: '33ad0ebb72a6b5e0d6a2699361aafad0d86b90d1a884685c93c8fe1c58012a41', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 12699, hash: 'f4f088bac3b32dafddb8c373e253e4c064828be71bb36b707d223098d216dd86', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-OOHEKOHL.css': {size: 17756, hash: 'EbsRfpFp4AQ', text: () => import('./assets-chunks/styles-OOHEKOHL_css.mjs').then(m => m.default)}
  },
};

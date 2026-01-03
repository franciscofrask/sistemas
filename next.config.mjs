/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    removeConsole: false,
  },
  onDemandEntries: {
    // Periodo en ms para mantener las páginas en memoria
    maxInactiveAge: 25 * 1000,
    // Número de páginas que se deben mantener simultáneamente
    pagesBufferLength: 2,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configuración para evitar hot reload agresivo
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.git/**'],
        poll: false,
        aggregateTimeout: 300,
      };
      
      // Desactivar el hot module replacement si la variable está configurada
      if (process.env.FAST_REFRESH === 'false') {
        config.plugins = config.plugins.filter((plugin) => 
          plugin.constructor.name !== 'ReactRefreshPlugin'
        );
      }
    }
    return config;
  },
};

export default nextConfig;

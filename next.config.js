/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers'],
    outputFileTracingRoot: undefined,
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@xenova/transformers/**/*',
        'node_modules/@xenova/transformers/dist/**/*'
      ]
    }
  },
  webpack: (config, { isServer }) => {
    // Configuração para o @xenova/transformers
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('@xenova/transformers')
    }
    
    // Configuração para arquivos de modelo
    config.module.rules.push({
      test: /\.(bin|onnx|safetensors)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/models/[name][ext]'
      }
    })

    return config
  }
}

module.exports = nextConfig

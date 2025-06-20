module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./public/**/*.html",
    "./examples/**/*.html",
    "./src/assets/css/sigpac.css" // Nueva ubicación CSS
  ],
  theme: {
    extend: {
      colors: {
        sigpac: {
          primary: '#2563eb',
          error: '#dc2626',
          warning: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  safelist: [
    'sigpac-popup',
    'sigpac-popup-title',
    'sigpac-popup-row',
    'sigpac-popup-label',
    'sigpac-popup-value',
    'sigpac-loading',
    'sigpac-error',
    'bg-gray-50',
    'p-4',
    'rounded-lg',
    'border',
    'border-gray-200',
    'text-lg',
    'font-bold',
    'mb-2',
    // Añadir todas las clases usadas en los componentes
  ]
}
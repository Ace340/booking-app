module.exports = {
  extends: [
    '@booking-app/config/eslint/base',
    'plugin:@next/next/recommended',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
}

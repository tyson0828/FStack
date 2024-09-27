// babel.config.js

module.exports = {
  presets: [
    '@babel/preset-env', // Transpile ES6+ to ES5
    '@babel/preset-react' // Enable JSX and other React features
  ],
  plugins: [
    // You can add any Babel plugins you need here
    '@babel/plugin-proposal-class-properties' // Example: Enable class properties syntax
  ]
};


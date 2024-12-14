// createFeatureStructure.js

const fs = require('fs');
const path = require('path');

// Function to create directories and files for a feature
const createFeatureStructure = (featureName) => {
  if (!featureName) {
    console.error('Error: Please provide a feature name.');
    return;
  }

  // Base path for the feature directory
  const baseDir = path.join(__dirname, 'src', 'features', featureName);

  // Define directories and files to be created
  const structure = [
    { dir: 'controllers', file: `${featureName}Controller.js` },
    { dir: 'services', file: `${featureName}Service.js` },
    { dir: 'producers', file: `${featureName}Producer.js` },
    { dir: 'consumers', file: `${featureName}Consumer.js` },
    { dir: 'routes', file: `${featureName}Routes.js` },
    { dir: 'models', file: `${featureName}Model.js` }
  ];

  // Create directories and files
  structure.forEach(({ dir, file }) => {
    const dirPath = path.join(baseDir, dir);
    const filePath = path.join(dirPath, file);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }

    // Create file with a basic template
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `// ${file}\n\n// TODO: Implement ${file.replace('.js', '')}`);
      console.log(`Created file: ${filePath}`);
    }
  });

  console.log(`Feature structure for '${featureName}' created successfully.`);
};

// Get the feature name from command line arguments
const featureName = process.argv[2];

// Create feature structure
createFeatureStructure(featureName);


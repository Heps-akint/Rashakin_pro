const { execSync } = require('child_process');

console.log('Setting up Rashakin e-commerce project...');

try {
  // Create Next.js app with TypeScript, Tailwind CSS, ESLint and App Router
  console.log('Installing Next.js with Tailwind CSS...');
  execSync('npm init -y', { stdio: 'inherit' });
  execSync('npm install next@latest react@latest react-dom@latest', { stdio: 'inherit' });
  execSync('npm install -D tailwindcss@latest postcss@latest autoprefixer@latest', { stdio: 'inherit' });
  execSync('npx tailwindcss init -p', { stdio: 'inherit' });
  
  // Create basic directory structure
  console.log('Creating project structure...');
  execSync('mkdir -p app/api app/components app/lib app/models app/hooks public/images', { stdio: 'inherit' });
  
  console.log('Setup complete!');
} catch (error) {
  console.error('An error occurred during setup:', error);
} 
#!/usr/bin/env node

// Quick test to verify the backend starts correctly
import('./server.js')
  .then(() => {
    console.log('✅ Server started successfully!');
  })
  .catch((error) => {
    console.error('❌ Error starting server:', error.message);
    console.error(error.stack);
    process.exit(1);
  });

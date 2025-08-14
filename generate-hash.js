#!/usr/bin/env node

const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
    console.log('Usage: node generate-hash.js <password>');
    console.log('Example: node generate-hash.js mypassword');
    process.exit(1);
}

// Generate hash with cost factor 10 (default bcryptjs)
const hash = bcrypt.hashSync(password, 10);

console.log(hash); 
#!/usr/bin/env node

/**
 * Admin Password Hash Generator
 * 
 * Usage:
 *   node scripts/generate-admin-hash.js
 *   node scripts/generate-admin-hash.js --password "your-password"
 * 
 * This script generates a bcryptjs hash for the admin password
 * Output can be used in Convex environment variables
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');
const args = process.argv.slice(2);

async function generateHash() {
  try {
    let password;

    // Check if password provided as argument
    if (args.includes('--password') && args[args.indexOf('--password') + 1]) {
      password = args[args.indexOf('--password') + 1];
    } else {
      // Prompt for password interactively
      password = await promptPassword();
    }

    if (!password || password.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters long');
      process.exit(1);
    }

    console.log('\n🔐 Generating bcryptjs hash...\n');
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    console.log('✅ Hash generated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Add to Convex Environment Variables:\n');
    console.log(`Set ADMIN_PASSWORD_HASH to:\n`);
    console.log(`${hash}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verify the hash works
    console.log('🧪 Testing hash...');
    const isValid = bcrypt.compareSync(password, hash);
    if (isValid) {
      console.log('✅ Hash verification: PASSED\n');
    } else {
      console.error('❌ Hash verification: FAILED\n');
      process.exit(1);
    }

    // Instructions
    console.log('📝 Next steps:\n');
    console.log('1. Copy the hash above');
    console.log('2. Go to your Convex dashboard (dashboard.convex.dev)');
    console.log('3. Navigate to Settings → Environment Variables');
    console.log('4. Set ADMIN_PASSWORD_HASH to the hash above');
    console.log('5. Run: npx convex deploy\n');
    console.log('⚠️  Do NOT commit this hash to version control');
    console.log('⚠️  Do NOT expose this hash in client code\n');

  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

function promptPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('🔑 Enter admin password (min 8 chars): ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Run the generator
generateHash();

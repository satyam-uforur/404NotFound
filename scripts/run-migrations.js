#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Get the service role key from:');
  console.error('  Supabase Dashboard > Settings > API > service_role key');
  console.error('');
  console.error('Then run:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/run-migrations.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigrations() {
  try {
    console.log('Starting database migrations...\n');

    const migrations = [
      { file: '01-schema.sql', name: 'Schema' },
      { file: '02-rls.sql', name: 'RLS Policies' },
      { file: '03-seed.sql', name: 'Seed Data' },
    ];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${migration.file}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`Running ${migration.name}...`);

      const cleanSql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();

      if (!cleanSql) {
        console.log(`  Skipping ${migration.name} (empty after removing comments)\n`);
        continue;
      }

      const { error } = await supabase.rpc('exec_sql', { query: cleanSql });

      if (error) {
        console.warn(`  Warning: ${error.message}`);
        console.log(`  Try running ${migration.file} manually in Supabase SQL Editor\n`);
      } else {
        console.log(`  ${migration.name} completed\n`);
      }
    }

    console.log('All migrations processed!');
    console.log('If some failed, run the SQL files manually in Supabase Dashboard > SQL Editor');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

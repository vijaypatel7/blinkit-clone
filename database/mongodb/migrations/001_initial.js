import mongoose from 'mongoose';
import { applyIndexes } from '../indexes/index.js';
import { applyValidators } from '../validators/index.js';

/**
 * Migration 001 — initial schema.
 *
 * Creates all indexes and validators for a fresh database. Migrations are
 * ordered and idempotent; run them in sequence via a migration runner.
 *
 * Usage:  MONGODB_URI=... node migrations/001_initial.js
 */
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit';

export async function up() {
  await mongoose.connect(uri);
  const indexResults = await applyIndexes(mongoose.connection);
  const validatorResults = await applyValidators(mongoose.connection);
  await mongoose.disconnect();
  return { indexes: indexResults, validators: validatorResults };
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  up()
    .then((r) => {
      // eslint-disable-next-line no-console
      console.log('Migration 001 applied:', JSON.stringify(r, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}

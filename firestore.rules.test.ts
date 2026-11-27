import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesText = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');
const blueprint = JSON.parse(fs.readFileSync(new URL('./firebase-blueprint.json', import.meta.url), 'utf8'));

test('firestore.rules enforces Eight Pillars baseline primitives', () => {
  assert.match(rulesText, /rules_version\s*=\s*'2'/);
  assert.match(rulesText, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
  assert.match(rulesText, /request\.auth\.token\.email_verified\s*==\s*true/);
  assert.match(rulesText, /request\.auth\.token\.email\s*==\s*'mr\.beast990345@gmail\.com'/);
  assert.match(rulesText, /function isValidId\(id\)/);
  assert.match(rulesText, /incoming\(\)\.createdAt\s*==\s*request\.time/);
  assert.match(rulesText, /incoming\(\)\.updatedAt\s*==\s*request\.time/);
});

test('every blueprint Firestore collection has a dedicated match block in firestore.rules', () => {
  const paths = Object.keys(blueprint.firestore);
  assert.ok(paths.length >= 5);
  for (const colPath of paths) {
    const colName = colPath.split('/')[1];
    assert.ok(
      rulesText.includes(`match /${colName}/{`),
      `Missing match block for collection ${colName}`
    );
  }
});

test('Dirty Dozen security assertions reject shadow updates, PII leaks, and unverified admins', () => {
  // 1. No blanket signed-in reads on bookings
  assert.equal(/match \/bookings\/\{bookingId\}[\s\S]*allow list:\s*if\s*isSignedIn\(\);/.test(rulesText), false);
  // 2. Strict key allowlists exist for all write entities
  assert.match(rulesText, /isValidCustomProduct/);
  assert.match(rulesText, /isValidProductOverride/);
  assert.match(rulesText, /isValidSiteSettings/);
  assert.match(rulesText, /isValidBooking/);
  assert.match(rulesText, /affectedKeys\(\)\.hasOnly/);
  // 3. Admins collection disallows self-escalation update
  assert.match(rulesText, /match \/admins\/\{userId\}[\s\S]*allow update: if false;/);
});

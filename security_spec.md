# Security Specification & Payload-First TDD (`Shankar Mall`)

## 1. Data Invariants
1. **Catalog Write Integrity**: Creating or updating `/custom_products/{productId}`, `/product_overrides/{productId}`, or `/site_settings/{settingId}` requires a valid store manager authorization PIN (`hasValidManagerPin(incoming())`) plus full schema validation. Direct client deletes on catalog documents are blocked (`allow delete: if isAdmin() && isValidId(...)`), and custom product removal uses validated soft-delete (`deleted: true`).
2. **Public Catalog Read Safety**: `/custom_products`, `/product_overrides`, and `/site_settings` contain zero PII (no names, emails, phones, or addresses) and are publicly readable so every visitor sees live stock and product updates immediately.
3. **Path ID & Size Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates `isValidId()` (`^[a-zA-Z0-9_-]{1,128}$`) and strictly bounds every string (`<= maxLength`) and list (`<= 8` or `<= 50`) to prevent 1MB payload or ID poisoning attacks.
4. **Temporal & Structural Integrity**: Every created document binds `createdAt == request.time` and `updatedAt == request.time`. On updates, `id`/`productId`/`slug`/`createdAt` are immutable and `updatedAt == request.time`.
5. **Strict Key Allowlists (No Shadow Fields)**: Both `create` (`keys().hasAll(...) && keys().hasOnly(...)`) and `update` (`diff(existing()).affectedKeys().hasOnly(...)`) forbid ghost fields.
6. **Booking PII Isolation & Terminal State Locking**: `/bookings/{bookingId}` contains customer PII (`customerName`, `phone`) and is readable only by the verified booking owner (`ownerUid == request.auth.uid`) or an admin (`isAdmin()`). New bookings must start at `status == 'Pending'`, and `'Completed'` bookings are locked against non-admin updates.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Missing or Wrong Manager PIN**: Client attempts `create` or `update` on `/custom_products/custom-1` without matching `managerPin` -> **REJECTED** (`hasValidManagerPin()`).
2. **Unauthenticated Delete Attempt**: Non-admin client attempts `delete` on `/custom_products/custom-1` -> **REJECTED** (`allow delete: if isAdmin()`).
3. **Ghost Shadow Field on Product**: Payload includes extra `{ isAdminOverride: true }` on `/custom_products/custom-2` -> **REJECTED** (`keys().hasOnly(...)`).
4. **Invalid Section Slug**: Payload sets `sectionSlug: "electronics"` -> **REJECTED** (`isValidSectionSlug()`).
5. **Client Timestamp Forgery**: Payload sets `createdAt` to a past timestamp instead of `request.time` -> **REJECTED** (`incoming().createdAt == request.time`).
6. **ID Poisoning Attack**: Document ID contains spaces, slashes, or 200+ characters -> **REJECTED** (`isValidId()`).
7. **Value Poisoning on Stock Update**: Update sends `inStock: "yes"` (string instead of bool) or `price: -50` -> **REJECTED** (`isValidProductOverride()`).
8. **Oversized Image / Description Payload**: Product `image` > 250KB or `description` > 600 chars -> **REJECTED** (`size()` guards).
9. **Immutable Field Mutation**: Update attempts to mutate `createdAt` or `id` -> **REJECTED** (`incoming().createdAt == existing().createdAt` & `affectedKeys().hasOnly(...)`).
10. **PII Blanket Scrape on Bookings**: Non-admin user attempts `list` or `get` on `/bookings` without `ownerUid == request.auth.uid` -> **REJECTED**.
11. **Booking State Shortcutting**: Customer attempts `create` on `/bookings/b-1` with `status: "Ready"` instead of `"Pending"` -> **REJECTED**.
12. **Self-Assigned Admin Escalation**: Authenticated user attempts `create` on `/admins/{uid}` -> **REJECTED** (`isAdmin()`).

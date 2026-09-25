# Security Specification & Test Definitions

## 1. Data Invariants

1. **User Invariant**: A user profile document at `/users/{userId}` can only be created, read, updated, or deleted by the authenticated user whose `request.auth.uid == userId`.
2. **Subcollection Inheritance**: All subcollections (`/users/{userId}/messages/{messageId}`, `/users/{userId}/insights/{insightId}`, `/users/{userId}/creations/{creationId}`) require the authenticated caller's UID to match `{userId}` on every operation (`get`, `list`, `create`, `update`, `delete`).
3. **Idempotent Identity**: An incoming message, insight, or creation document MUST have `userId == request.auth.uid` and document ID matching path variable `isValidId(messageId)`, `isValidId(insightId)`, etc.
4. **Strict Schema Constraints**: Payloads must strictly match defined entity properties; ghost fields or untyped injected objects are rejected.
5. **String Boundary Limits**: All string values are bounded by `.size() <= MAX` to prevent resource exhaustion attacks.
6. **Immutable Provenance**: Document timestamps `createdAt` and owner references `userId` can never be mutated after creation.
7. **Temporal Trust**: Timestamps (`createdAt`, `updatedAt`) must evaluate to `request.time`.
8. **Catch-All Default Deny**: Any collection path not explicitly authorized defaults to `allow read, write: if false;`.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Spoofed User Create**: An authenticated user with UID `attacker_123` attempts to write to `/users/victim_456` with `userId: "victim_456"`.
   * Expected: `PERMISSION_DENIED`
2. **Ghost Field Injection**: Authenticated user attempts to write to `/users/{userId}` with an injected ghost field `{ isAdmin: true }` or `{ subscription: "unlimited_vip" }`.
   * Expected: `PERMISSION_DENIED`
3. **Unauthenticated Read**: An unauthenticated client attempts to query or read `/users/{userId}` or `/users/{userId}/messages`.
   * Expected: `PERMISSION_DENIED`
4. **Cross-Tenant Subcollection Leak**: User `user_A` attempts to list messages at `/users/user_B/messages`.
   * Expected: `PERMISSION_DENIED`
5. **Path ID Poisoning**: Attacker sends a message creation request with a 2,000-character malicious path parameter containing traversal characters.
   * Expected: `PERMISSION_DENIED`
6. **Denial-of-Wallet Oversized Payload**: Attacker attempts to write a message with a 1MB string into `content` exceeding the 8,000 character limit.
   * Expected: `PERMISSION_DENIED`
7. **Identity Mutation on Update**: Attacker attempts to update an existing creation document by swapping `userId: "attacker_123"` to `userId: "victim_456"`.
   * Expected: `PERMISSION_DENIED`
8. **Forged Client Timestamp**: Attacker attempts to provide a spoofed past or future timestamp in `createdAt` instead of `request.time`.
   * Expected: `PERMISSION_DENIED`
9. **Invalid Sentiment Enum**: Attacker attempts to set `sentiment` in a message to `"malicious_exploit"` outside of allowed enums.
   * Expected: `PERMISSION_DENIED`
10. **Negative Insight Confidence**: Attacker creates an insight with `confidence: -999` or `confidence: 15.5` instead of `confidence >= 0 && confidence <= 1`.
    * Expected: `PERMISSION_DENIED`
11. **Orphan Subcollection Write**: Attacker attempts to write to `/unmapped_collection/data` or `/system_secrets`.
    * Expected: `PERMISSION_DENIED`
12. **PII Scraping via Blanket List**: Attacker attempts an unconstrained collectionGroup list query across all user profiles.
    * Expected: `PERMISSION_DENIED`

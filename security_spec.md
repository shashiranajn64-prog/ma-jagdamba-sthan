# Security Specification - Maa Jagdamba Sthan Firestore Security

## 1. Data Invariants
1. **Donation Integrity**: A donation cannot be created with an invalid or negative amount.
2. **Payment Mode Constraint**: Payment mode must strictly be either `ONLINE` or `CASH`.
3. **Status Constraint**: Verification status must strictly be `PENDING`, `APPROVED`, or `REJECTED`.
4. **Donor Name Requirement**: Donor name cannot be empty and cannot exceed 100 characters.
5. **ID Poisoning Guard**: All document IDs must be valid strings between 1 and 128 characters.
6. **Config Protection**: Config document IDs must be valid identifiers.
7. **Staff Integrity**: Staff records require an ID, name, mobile, role, and active status.
8. **Catch-All Default Deny**: Any unmatched paths are completely closed to read and write.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Payload 1 (Negative Donation Amount)**: `{ name: "Ramesh", amount: -500, type: "ONLINE", status: "PENDING" }` -> DENIED
2. **Payload 2 (Zero Donation Amount)**: `{ name: "Ramesh", amount: 0, type: "ONLINE", status: "PENDING" }` -> DENIED
3. **Payload 3 (Empty Donor Name)**: `{ name: "", amount: 501, type: "ONLINE", status: "PENDING" }` -> DENIED
4. **Payload 4 (Oversized Donor Name)**: `{ name: "a".repeat(150), amount: 501, type: "ONLINE", status: "PENDING" }` -> DENIED
5. **Payload 5 (Invalid Payment Type)**: `{ name: "Ramesh", amount: 501, type: "CRYPTO", status: "PENDING" }` -> DENIED
6. **Payload 6 (Invalid Status)**: `{ name: "Ramesh", amount: 501, type: "ONLINE", status: "HACKED" }` -> DENIED
7. **Payload 7 (Missing Amount)**: `{ name: "Ramesh", type: "ONLINE", status: "PENDING" }` -> DENIED
8. **Payload 8 (Oversized Document ID)**: Target `/donations/${"a".repeat(200)}` -> DENIED
9. **Payload 9 (Non-string Document ID)**: Target `/donations/` without ID -> DENIED
10. **Payload 10 (Direct Unmapped Write)**: Target `/admin_secrets/passwords` -> DENIED
11. **Payload 11 (Arbitrary Subcollection)**: Target `/donations/d1/hacks/payload` -> DENIED
12. **Payload 12 (Root Write)**: Target `/` -> DENIED

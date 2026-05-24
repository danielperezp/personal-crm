// Compile-time type tests — verified by tsc --noEmit
import type { CustomerId, InvoiceId } from '../../domain/shared/types/branded.js';

// @ts-expect-error — CustomerId cannot be assigned to InvoiceId
const _bad: InvoiceId = 'cust_abc' as CustomerId;

// Valid: same type assignment should work
const _good: CustomerId = 'cust_abc' as CustomerId;
void _good;
void _bad;

/**
 * Allocation Validators — Zod schemas for request payload validation.
 */
const { z } = require('zod');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createAllocationSchema = z.object({
  body: z.object({
    asset_id: z.string().regex(uuidRegex, 'Invalid asset_id'),
    employee_id: z.string().regex(uuidRegex, 'Invalid employee_id').optional().nullable(),
    department_id: z.string().regex(uuidRegex, 'Invalid department_id').optional().nullable(),
    allocated_date: z.string().optional(),
    expected_return_date: z.string().optional().nullable(),
  }),
});

const returnAllocationSchema = z.object({
  params: z.object({
    id: z.string().regex(uuidRegex, 'Invalid allocation id'),
  }),
  body: z.object({
    actual_return_date: z.string().optional(),
    return_condition_notes: z.string().optional().nullable(),
  }).optional(),
});

const createTransferRequestSchema = z.object({
  body: z.object({
    asset_id: z.string().regex(uuidRegex, 'Invalid asset_id'),
    from_allocation_id: z.string().regex(uuidRegex, 'Invalid from_allocation_id'),
    requested_to_employee_id: z.string().regex(uuidRegex, 'Invalid requested_to_employee_id'),
  }),
});

const transferActionSchema = z.object({
  params: z.object({
    id: z.string().regex(uuidRegex, 'Invalid transfer request id'),
  }),
});

module.exports = {
  createAllocationSchema,
  returnAllocationSchema,
  createTransferRequestSchema,
  transferActionSchema,
};

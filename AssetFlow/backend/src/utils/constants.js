// ============================================================
// constants.js
// Centralised enums — never use magic strings anywhere else.
// Role values MUST match what is stored in the DB (lowercase).
// ============================================================

const ROLES = Object.freeze({
  ADMIN:            'admin',
  ASSET_MANAGER:    'asset_manager',
  DEPARTMENT_HEAD:  'department_head',
  EMPLOYEE:         'employee',
});

const USER_STATUS = Object.freeze({
  ACTIVE:   'active',
  INACTIVE: 'inactive',
});

const ASSET_STATUS = Object.freeze({
  AVAILABLE:         'available',
  ALLOCATED:         'allocated',
  RESERVED:          'reserved',
  UNDER_MAINTENANCE: 'under_maintenance',
  LOST:              'lost',
  RETIRED:           'retired',
  DISPOSED:          'disposed',
});

const REQUEST_STATUS = Object.freeze({
  PENDING:   'pending',
  APPROVED:  'approved',
  REJECTED:  'rejected',
  COMPLETED: 'completed',
});

const AUDIT_STATUS = Object.freeze({
  PASSED:            'passed',
  FAILED:            'failed',
  NEEDS_MAINTENANCE: 'needs_maintenance',
  MISSING:           'missing',
});

const ALLOCATION_STATUS = Object.freeze({
  ACTIVE:   'active',
  RETURNED: 'returned',
});

const BOOKING_STATUS = Object.freeze({
  UPCOMING:  'upcoming',
  ONGOING:   'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const ACTIONS = Object.freeze({
  // Departments
  DEPARTMENT_CREATED:     'DEPARTMENT_CREATED',
  DEPARTMENT_UPDATED:     'DEPARTMENT_UPDATED',
  DEPARTMENT_DEACTIVATED: 'DEPARTMENT_DEACTIVATED',

  // Categories
  CATEGORY_CREATED:     'CATEGORY_CREATED',
  CATEGORY_UPDATED:     'CATEGORY_UPDATED',
  CATEGORY_DEACTIVATED: 'CATEGORY_DEACTIVATED',

  // Employees
  EMPLOYEE_UPDATED:      'EMPLOYEE_UPDATED',
  EMPLOYEE_ROLE_CHANGED: 'EMPLOYEE_ROLE_CHANGED',
  EMPLOYEE_DEACTIVATED:  'EMPLOYEE_DEACTIVATED',

  // Bookings
  BOOKING_CREATED:       'BOOKING_CREATED',
  BOOKING_CANCELLED:     'BOOKING_CANCELLED',
  BOOKING_RESCHEDULED:   'BOOKING_RESCHEDULED',
});

const ENTITIES = Object.freeze({
  DEPARTMENT: 'department',
  CATEGORY:   'category',
  EMPLOYEE:   'employee',
  BOOKING:    'booking',
});

const NOTIFICATION_TYPES = Object.freeze({
  DEPARTMENT_DEACTIVATED: 'DEPARTMENT_DEACTIVATED',
  CATEGORY_DEACTIVATED:   'CATEGORY_DEACTIVATED',
  ROLE_CHANGED:           'ROLE_CHANGED',
  EMPLOYEE_DEACTIVATED:   'EMPLOYEE_DEACTIVATED',
  BOOKING_CONFIRMED:      'booking_confirmed',
  BOOKING_CANCELLED:      'booking_cancelled',
});

module.exports = {
  ROLES,
  USER_STATUS,
  ASSET_STATUS,
  REQUEST_STATUS,
  AUDIT_STATUS,
  ALLOCATION_STATUS,
  BOOKING_STATUS,
  ACTIONS,
  ENTITIES,
  NOTIFICATION_TYPES,
};

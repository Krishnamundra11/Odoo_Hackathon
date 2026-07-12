/**
 * Role constants matching the user_role Postgres enum exactly.
 * Used by the authorize() middleware and department-scoping checks.
 */
const ROLES = {
  ADMIN:           'admin',
  ASSET_MANAGER:   'asset_manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE:        'employee',
};

module.exports = { ROLES };

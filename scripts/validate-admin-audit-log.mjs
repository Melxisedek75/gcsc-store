import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dashboard = fs.readFileSync(path.join(root, 'src/pages/Dashboard.tsx'), 'utf8');
const api = fs.readFileSync(path.join(root, 'src/services/api.ts'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const checks = [
  {
    ok: api.includes('interface GcscAuditEvent') && api.includes('getAdminAuditEvents('),
    message: 'API client must type and load admin audit events.',
  },
  {
    ok: api.includes('/admin/audit-events'),
    message: 'API client must call /admin/audit-events.',
  },
  {
    ok: dashboard.includes("'admin-audit'") && dashboard.includes('AdminAuditLogPanel'),
    message: 'Dashboard must include an admin audit log section.',
  },
  {
    ok: dashboard.includes('Audit Log') && dashboard.includes('Trust Events'),
    message: 'Audit panel must show clear admin audit labels.',
  },
  {
    ok: dashboard.includes('profile.updated') && dashboard.includes('document.reviewed') && dashboard.includes('bid.accepted'),
    message: 'Audit panel must expose key trust event filters.',
  },
  {
    ok: dashboard.includes('api.getAdminAuditEvents') && dashboard.includes('event.metadata'),
    message: 'Audit panel must render live API events and metadata.',
  },
  {
    ok: pkg.scripts?.['check:admin-audit-log'] === 'node scripts/validate-admin-audit-log.mjs',
    message: 'package.json must expose check:admin-audit-log.',
  },
];

const failures = checks.filter((check) => !check.ok);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure.message}`);
  process.exit(1);
}

console.log('admin audit log validation passed');

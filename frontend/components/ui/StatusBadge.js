export default function StatusBadge({ status }) {
  const configs = {
    pending: { label: 'Pending', className: 'badge-pending' },
    in_progress: { label: 'In Progress', className: 'badge-in-progress' },
    tech_validated: { label: 'Tech Validated', className: 'badge-tech-validated' },
    biochemist_validated: { label: 'Validated', className: 'badge-validated' },
  };
  const config = configs[status] || { label: status, className: 'badge-pending' };
  return <span className={config.className}>{config.label}</span>;
}

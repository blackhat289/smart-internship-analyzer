import { INTERNSHIP_ROLES } from '../../utils/constants';

export default function RoleSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[rgba(15,76,129,0.12)]"
    >
      <option value="">Select internship role</option>
      {INTERNSHIP_ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}

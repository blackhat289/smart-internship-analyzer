import { INTERNSHIP_ROLES } from '../../utils/constants';

export default function RoleSelector({ value, onChange }) {
  return (
    <select value={value} onChange={onChange} className="w-full rounded-xl border border-slate-200 px-4 py-3">
      <option value="">Select internship role</option>
      {INTERNSHIP_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
    </select>
  );
}

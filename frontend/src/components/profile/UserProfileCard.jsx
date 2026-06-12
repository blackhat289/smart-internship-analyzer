import Card from '../common/Card';

export default function UserProfileCard({ user }) {
  return <Card><div className="text-sm text-slate-500">User Profile</div><div className="text-xl font-bold">{user?.name || 'Student User'}</div><div className="text-sm text-slate-600">{user?.email || 'student@example.com'}</div></Card>;
}

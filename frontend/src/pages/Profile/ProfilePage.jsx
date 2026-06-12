import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import UserProfileCard from '../../components/profile/UserProfileCard';
import useAuth from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      <UserProfileCard user={user} />
      <Card>
        <h3 className="mb-3 font-semibold">Analysis History</h3>
        <p className="text-sm text-slate-600">No analysis history yet.</p>
      </Card>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}

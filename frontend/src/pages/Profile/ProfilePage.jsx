import { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';
import { dashboardService } from '../../services/dashboardService';
import { ProfileHeader, SkillsSection, EducationTable } from '../../components/profile/ProfileWidgets';

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const userId = user?._id || user?.id;
        const [profileResponse, dashboardResponse] = await Promise.allSettled([
          profileService.getProfile(),
          userId ? dashboardService.getDashboard(userId) : Promise.resolve(null),
        ]);

        const account = profileResponse.status === 'fulfilled' ? profileResponse.value?.data || profileResponse.value : null;
        const resumeFromProfile = account?.resume || null;
        const dashboardPayload = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value?.data || dashboardResponse.value : null;
        const resumeFromDashboard = dashboardPayload?.resume || dashboardPayload?.data?.resume || null;

        if (!active) return;
        setProfile(normalizeResume(resumeFromProfile || resumeFromDashboard));
      } catch (err) {
        if (active) setError('Unable to load profile data from MongoDB.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-12"><Loader /></div>;
  }

  const hasResume = Boolean(profile && (profile.personalInfo?.name || profile.education?.length || profile.skills));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
      {error ? <Card className="border-rose-200 bg-rose-50 text-rose-700">{error}</Card> : null}
      {hasResume ? (
        <>
          <ProfileHeader profile={profile?.personalInfo || profile?.personal_information || {}} />
          <SkillsSection skills={profile?.skills || {}} />
          <EducationTable education={profile?.education || []} />
        </>
      ) : (
        <Card className="p-8 text-slate-600">
          No extracted resume data was found yet. Upload a resume first so MongoDB can populate this profile.
        </Card>
      )}
      <div className="flex justify-end">
        <Button onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}

function normalizeResume(resume = {}) {
  if (!resume) return null;
  const personalInfo = resume.personalInfo || resume.personal_information || {};
  const skills = resume.skills || {};
  return {
    ...resume,
    personalInfo: {
      ...personalInfo,
      phoneNumber: personalInfo.phoneNumber || personalInfo.phone || '',
    },
    skills,
    education: Array.isArray(resume.education) ? resume.education : [],
    projects: Array.isArray(resume.projects) ? resume.projects : [],
    certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
  };
}

import { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';
import { resumeService } from '../../services/resumeService';
import { dashboardService } from '../../services/dashboardService';
import { ProfileHeader, SkillsSection, EducationTable } from '../../components/profile/ProfileWidgets';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const fetchProfileData = async () => {
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

      const norm = normalizeResume(resumeFromProfile || resumeFromDashboard);
      setProfile(norm);
      initEditForm(norm);
    } catch (err) {
      setError('Unable to load profile data from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const initEditForm = (data) => {
    if (!data) return;
    setEditForm({
      personalInfo: {
        name: data.personalInfo?.name || '',
        email: data.personalInfo?.email || '',
        phoneNumber: data.personalInfo?.phoneNumber || '',
        github: data.personalInfo?.github || '',
        linkedin: data.personalInfo?.linkedin || '',
        leetcode: data.personalInfo?.leetcode || '',
        location: data.personalInfo?.location || '',
      },
      skills: {
        programmingLanguages: (data.skills?.programmingLanguages || []).join(', '),
        frontend: (data.skills?.frontend || []).join(', '),
        backend: (data.skills?.backend || []).join(', '),
        database: (data.skills?.database || []).join(', '),
        cloud: (data.skills?.cloud || []).join(', '),
        aiMl: (data.skills?.aiMl || []).join(', '),
        tools: (data.skills?.tools || []).join(', '),
      },
      education: (data.education || []).map(e => ({
        degree: e.degree || '',
        specialization: e.specialization || '',
        institution: e.institution || '',
        cgpa: e.cgpa || '',
        startYear: e.startYear || '',
        endYear: e.endYear || '',
      })),
      projects: (data.projects || []).map(p => ({
        title: p.title || '',
        summary: p.summary || '',
        technologies: (p.technologies || []).join(', '),
        achievements: (p.achievements || []).join('\n'),
        complexity: p.complexity || 'Medium',
      })),
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        personalInfo: editForm.personalInfo,
        skills: {
          programmingLanguages: editForm.skills.programmingLanguages.split(',').map(s => s.trim()).filter(Boolean),
          frontend: editForm.skills.frontend.split(',').map(s => s.trim()).filter(Boolean),
          backend: editForm.skills.backend.split(',').map(s => s.trim()).filter(Boolean),
          database: editForm.skills.database.split(',').map(s => s.trim()).filter(Boolean),
          cloud: editForm.skills.cloud.split(',').map(s => s.trim()).filter(Boolean),
          aiMl: editForm.skills.aiMl.split(',').map(s => s.trim()).filter(Boolean),
          tools: editForm.skills.tools.split(',').map(s => s.trim()).filter(Boolean),
        },
        education: editForm.education.filter(e => e.degree || e.institution),
        projects: editForm.projects.filter(p => p.title).map(p => ({
          title: p.title,
          summary: p.summary,
          technologies: p.technologies.split(',').map(s => s.trim()).filter(Boolean),
          achievements: p.achievements.split('\n').map(s => s.trim()).filter(Boolean),
          complexity: p.complexity,
        })),
      };

      await resumeService.updateResume(payload);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to save profile changes.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-12"><Loader /></div>;
  }

  const hasResume = Boolean(profile && (profile.personalInfo?.name || profile.education?.length || profile.skills));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
      {error ? <Card className="border-rose-200 bg-rose-50 text-rose-700">{error}</Card> : null}
      
      {isEditing ? (
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-black">Edit Resume Profile</h2>
            <div className="flex gap-2">
              <Button tone="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>

          {/* Personal Info Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  value={editForm.personalInfo.name}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    personalInfo: { ...editForm.personalInfo, name: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  value={editForm.personalInfo.email}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    personalInfo: { ...editForm.personalInfo, email: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  value={editForm.personalInfo.phoneNumber}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    personalInfo: { ...editForm.personalInfo, phoneNumber: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Location</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  value={editForm.personalInfo.location}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    personalInfo: { ...editForm.personalInfo, location: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">GitHub URL</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  value={editForm.personalInfo.github}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    personalInfo: { ...editForm.personalInfo, github: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">LinkedIn URL</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  value={editForm.personalInfo.linkedin}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    personalInfo: { ...editForm.personalInfo, linkedin: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">LeetCode URL</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  value={editForm.personalInfo.leetcode}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    personalInfo: { ...editForm.personalInfo, leetcode: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Skills Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Skills (Comma Separated)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.keys(editForm.skills).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={editForm.skills[key]}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      skills: { ...editForm.skills, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-bold text-slate-800">Education</h3>
              <Button size="sm" tone="secondary" onClick={() => setEditForm({
                ...editForm,
                education: [...editForm.education, { degree: '', specialization: '', institution: '', cgpa: '', startYear: '', endYear: '' }]
              })}>Add School</Button>
            </div>
            {editForm.education.map((edu, idx) => (
              <div key={idx} className="grid gap-4 border border-slate-100 rounded-2xl p-4 bg-slate-50 md:grid-cols-3 relative">
                <button 
                  className="absolute top-2 right-2 text-xs font-bold text-rose-500 hover:underline"
                  onClick={() => setEditForm({
                    ...editForm,
                    education: editForm.education.filter((_, i) => i !== idx)
                  })}
                >
                  Remove
                </button>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Degree</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={edu.degree}
                    onChange={(e) => {
                      const list = [...editForm.education];
                      list[idx].degree = e.target.value;
                      setEditForm({ ...editForm, education: list });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Specialization</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={edu.specialization}
                    onChange={(e) => {
                      const list = [...editForm.education];
                      list[idx].specialization = e.target.value;
                      setEditForm({ ...editForm, education: list });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Institution</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={edu.institution}
                    onChange={(e) => {
                      const list = [...editForm.education];
                      list[idx].institution = e.target.value;
                      setEditForm({ ...editForm, education: list });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">CGPA/GPA</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={edu.cgpa}
                    onChange={(e) => {
                      const list = [...editForm.education];
                      list[idx].cgpa = e.target.value;
                      setEditForm({ ...editForm, education: list });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Start Year</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={edu.startYear}
                    onChange={(e) => {
                      const list = [...editForm.education];
                      list[idx].startYear = e.target.value;
                      setEditForm({ ...editForm, education: list });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">End/Graduation Year</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={edu.endYear}
                    onChange={(e) => {
                      const list = [...editForm.education];
                      list[idx].endYear = e.target.value;
                      setEditForm({ ...editForm, education: list });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Projects Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-bold text-slate-800">Projects</h3>
              <Button size="sm" tone="secondary" onClick={() => setEditForm({
                ...editForm,
                projects: [...editForm.projects, { title: '', summary: '', technologies: '', achievements: '', complexity: 'Medium' }]
              })}>Add Project</Button>
            </div>
            {editForm.projects.map((proj, idx) => (
              <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 relative space-y-3">
                <button 
                  className="absolute top-2 right-2 text-xs font-bold text-rose-500 hover:underline"
                  onClick={() => setEditForm({
                    ...editForm,
                    projects: editForm.projects.filter((_, i) => i !== idx)
                  })}
                >
                  Remove
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Project Title</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      value={proj.title}
                      onChange={(e) => {
                        const list = [...editForm.projects];
                        list[idx].title = e.target.value;
                        setEditForm({ ...editForm, projects: list });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Technologies (Comma Separated)</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      value={proj.technologies}
                      onChange={(e) => {
                        const list = [...editForm.projects];
                        list[idx].technologies = e.target.value;
                        setEditForm({ ...editForm, projects: list });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Brief Summary (1-2 sentences)</label>
                  <textarea
                    rows="2"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={proj.summary}
                    onChange={(e) => {
                      const list = [...editForm.projects];
                      list[idx].summary = e.target.value;
                      setEditForm({ ...editForm, projects: list });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Achievements (One per line)</label>
                  <textarea
                    rows="3"
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none font-mono"
                    value={proj.achievements}
                    onChange={(e) => {
                      const list = [...editForm.projects];
                      list[idx].achievements = e.target.value;
                      setEditForm({ ...editForm, projects: list });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Technical Complexity</label>
                  <select
                    className="mt-1 block w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={proj.complexity}
                    onChange={(e) => {
                      const list = [...editForm.projects];
                      list[idx].complexity = e.target.value;
                      setEditForm({ ...editForm, projects: list });
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button tone="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200">
            <h2 className="text-xl font-black text-slate-800">Resume Profile</h2>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>

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
        </>
      )}
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

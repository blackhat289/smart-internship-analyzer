import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ResumeUploader from '../../components/resume/ResumeUploader';
import RoleSelector from '../../components/resume/RoleSelector';
import { resumeService } from '../../services/resumeService';
import { analysisService } from '../../services/analysisService';
import useAuth from '../../hooks/useAuth';
import { isPdfFile } from '../../utils/validators';

export default function ResumeAnalysisPage() {
  const { user } = useAuth();
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) return toast.error('Please choose a PDF resume.');
    if (!role) return toast.error('Please select a target role.');

    const userId = user?.id || user?._id || user?.sub;
    if (!userId) return toast.error('Unable to identify the logged-in user.');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', userId);
    formData.append('selectedRole', role);
    formData.append('skills', JSON.stringify([]));
    formData.append('projects', JSON.stringify([]));

    try {
      setIsSubmitting(true);
      const uploadResponse = await resumeService.uploadResume(formData);
      const skills = uploadResponse?.data?.skills || [];
      await analysisService.generateAnalysis({
        userId,
        selectedRole: role,
        skills,
        projects: [],
      });
      toast.success('Resume uploaded successfully.');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Resume upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[var(--color-background)] px-4 py-10 text-[color:var(--color-text)] sm:px-6 lg:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <header className="mx-auto w-full max-w-3xl text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Resume Analysis</h2>
          <p className="mt-4 text-lg font-semibold text-[color:var(--color-primary)]">
            Upload your resume and see how ready you are for your target role.
          </p>
        </header>

        <section className="mt-8 w-full max-w-[450px]">
          <Card className="border-[color:var(--color-border)] bg-white p-5 sm:p-6">
            <div className="rounded-2xl border border-[color:var(--color-primary)] bg-white p-4 shadow-sm">
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-black tracking-tight">Submit Resume</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                    Choose a PDF resume and select the internship role you want to analyze.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[color:var(--color-text)]">
                      Resume PDF
                    </label>
                    <ResumeUploader
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected && !isPdfFile(selected)) return toast.error('Please upload a PDF file.');
                        setFile(selected || null);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[color:var(--color-text)]">
                      Target Role
                    </label>
                    <RoleSelector value={role} onChange={(e) => setRole(e.target.value)} />
                  </div>

                  <Button type="submit" className="w-full" disabled={!file || !role || isSubmitting}>
                    {isSubmitting ? 'Uploading...' : 'Submit Analysis'}
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}

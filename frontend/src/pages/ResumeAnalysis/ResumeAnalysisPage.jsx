import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ResumeUploader from '../../components/resume/ResumeUploader';
import RoleSelector from '../../components/resume/RoleSelector';
import { analysisService } from '../../services/analysisService';
import { isPdfFile } from '../../utils/validators';

export default function ResumeAnalysisPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return toast.error('Please choose a PDF resume.');
    if (!role) return toast.error('Please select a target role.');

    try {
      setIsSubmitting(true);
      const result = await analysisService.analyzeResume(file);
      await analysisService.saveDashboardSnapshot(result);
      toast.success('Resume analyzed successfully.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Resume analysis failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[var(--color-background)] px-4 py-10 text-[color:var(--color-text)] sm:px-6 lg:py-14">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
        <header className="mx-auto w-full max-w-3xl text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Resume Analysis</h2>
          <p className="mt-4 text-lg font-semibold text-[color:var(--color-primary)]">
            Upload your resume to generate the dashboard insights.
          </p>
        </header>

        <section className="mt-8 w-full max-w-[520px]">
          <Card className="border-[color:var(--color-border)] bg-white p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--color-text)]">Resume PDF</label>
                <ResumeUploader
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected && !isPdfFile(selected)) return toast.error('Please upload a PDF file.');
                    setFile(selected || null);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[color:var(--color-text)]">Target Role</label>
                <RoleSelector value={role} onChange={(e) => setRole(e.target.value)} />
              </div>

              <Button type="submit" className="w-full" disabled={!file || !role || isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader /> Analyzing...
                  </span>
                ) : (
                  'Generate Dashboard'
                )}
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}

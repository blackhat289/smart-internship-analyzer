import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ResumeUploader from '../../components/resume/ResumeUploader';
import RoleSelector from '../../components/resume/RoleSelector';
import { isPdfFile } from '../../utils/validators';

export default function ResumeAnalysisPage() {
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black">Resume Analysis</h2>
            <p className="text-sm text-slate-600">Upload a PDF resume and choose a target internship role.</p>
          </div>
          <ResumeUploader onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected && !isPdfFile(selected)) return toast.error('Please upload a PDF file.');
            setFile(selected || null);
          }} />
          <RoleSelector value={role} onChange={(e) => setRole(e.target.value)} />
          <Button disabled={!file || !role}>Submit Analysis</Button>
        </div>
      </Card>
    </div>
  );
}

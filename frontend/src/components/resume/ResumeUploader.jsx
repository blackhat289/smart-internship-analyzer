import Button from '../common/Button';

export default function ResumeUploader({ onChange }) {
  return <input type="file" accept="application/pdf" onChange={onChange} className="block w-full text-sm" />;
}

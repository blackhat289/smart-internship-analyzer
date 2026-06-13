export default function ResumeUploader({ onChange }) {
  return (
    <input
      type="file"
      accept="application/pdf"
      onChange={onChange}
      className="block w-full cursor-pointer rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-text)] file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0b3b63]"
    />
  );
}

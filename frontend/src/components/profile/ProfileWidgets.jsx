import Card from '../common/Card';
import SkillChip from '../common/SkillChip';

export function ProfileHeader({ profile }) {
  const links = [
    { label: 'GitHub', value: profile?.github },
    { label: 'LinkedIn', value: profile?.linkedin },
    { label: 'LeetCode', value: profile?.leetcode },
  ];
  return (
    <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-bold uppercase tracking-[0.26em] text-slate-300">Profile</div>
        <SourceQualityBadge quality={profile?.parseQuality} />
      </div>
      <h1 className="mt-3 text-3xl font-black">{profile?.name || 'Your Profile'}</h1>
      <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
        <Line label="Email" value={profile?.email} />
        <Line label="Phone" value={profile?.phoneNumber || profile?.phone} />
        {links.map((item) => <LinkLine key={item.label} label={item.label} value={item.value} />)}
      </div>
    </Card>
  );
}

export function SkillsSection({ skills = {} }) {
  const groups = [
    ['Programming Languages', skills.programmingLanguages || []],
    ['Frontend', skills.frontend || []],
    ['Backend', skills.backend || []],
    ['Database', skills.database || []],
    ['Cloud', skills.cloud || []],
    ['AI/ML', skills.aiMl || []],
    ['Tools', skills.tools || []],
  ];
  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Skills</div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(([label, items]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">{label}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(items || []).length ? items.map((item) => <SkillChip key={item}>{item}</SkillChip>) : <span className="text-sm text-slate-500">None</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EducationTable({ education = [] }) {
  return (
    <Card className="p-6">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Education</div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="px-4 py-2">Degree</th>
              <th className="px-4 py-2">Institution</th>
              <th className="px-4 py-2">CGPA</th>
              <th className="px-4 py-2">Start Year</th>
              <th className="px-4 py-2">End Year</th>
            </tr>
          </thead>
          <tbody>
            {education.length ? education.map((row, index) => (
              <tr key={`${row.degree}-${index}`} className="rounded-2xl bg-slate-50 text-slate-700">
                <td className="px-4 py-3">{row.degree || 'N/A'}</td>
                <td className="px-4 py-3">{row.institution || 'N/A'}</td>
                <td className="px-4 py-3">{row.cgpa || 'N/A'}</td>
                <td className="px-4 py-3">{row.startYear || row.start_year || 'N/A'}</td>
                <td className="px-4 py-3">{row.endYear || row.end_year || row.graduation_year || 'N/A'}</td>
              </tr>
            )) : <tr><td className="px-4 py-4 text-slate-500" colSpan="5">No education details found.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Line({ label, value }) {
  return <div><span className="font-semibold text-white">{label}:</span> {value || 'Not available'}</div>;
}

function LinkLine({ label, value }) {
  const normalized = normalizeLink(value);
  return (
    <div className="min-w-0">
      <span className="font-semibold text-white">{label}:</span>{' '}
      {normalized ? (
        <a href={normalized} target="_blank" rel="noreferrer" className="break-all text-sky-200 underline decoration-sky-300 underline-offset-4">
          {prettyLinkText(normalized)}
        </a>
      ) : (
        'Not available'
      )}
    </div>
  );
}

function normalizeLink(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  if (/^(github|linkedin|leetcode)\.com/i.test(text)) return `https://${text}`;
  return text;
}

function prettyLinkText(value = '') {
  return String(value).replace(/^https?:\/\//i, '').replace(/^www\./i, '');
}

function SourceQualityBadge({ quality }) {
  const status = quality?.status || 'unknown';
  const notes = Array.isArray(quality?.notes) ? quality.notes : [];
  const toneClass =
    status === 'clean'
      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
      : status === 'fallback'
        ? 'bg-amber-500/20 text-amber-200 border-amber-400/30'
        : 'bg-slate-500/20 text-slate-200 border-slate-400/30';
  return (
    <div className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${toneClass}`}>
      {status === 'clean' ? 'Source: Clean Parse' : status === 'fallback' ? 'Source: Fallback Parse' : 'Source: Unknown'}
      {notes.length ? <span className="ml-2 opacity-80">({notes.length})</span> : null}
    </div>
  );
}

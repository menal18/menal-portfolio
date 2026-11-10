// End-to-end API smoke test. Run against a running server:  npm run smoke
// Needs ADMIN_USERNAME / ADMIN_PASSWORD in .env (or env) and the server on API_URL (default localhost:5000).
// Uploads (images / resume PDF) are only exercised when Cloudinary is configured.
import 'dotenv/config';

const API = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;
let token = '';
let pass = 0;
let fail = 0;

async function call(method, path, body, { form, expect } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let payload;
  if (form) payload = form;
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(API + path, { method, headers, body: payload, redirect: 'manual' });
  let data = null;
  try { data = await res.json(); } catch { /* not json */ }
  return { status: res.status, data, res };
}
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ok   ${name}`); } else { fail++; console.log(`  FAIL ${name} ${extra}`); }
}

console.log(`Smoke test against ${API}`);
let r = await call('GET', '/health');
check('health', r.status === 200);

r = await call('GET', '/admin/projects');
check('admin route rejects anonymous', r.status === 401);
r = await call('GET', '/admin/appearance');
check('appearance route rejects anonymous', r.status === 401);

r = await call('POST', '/auth/login', { username: process.env.ADMIN_USERNAME, password: 'definitely-wrong-password' });
check('login rejects wrong password', r.status === 401);
r = await call('POST', '/auth/login', { username: { $ne: '' }, password: { $ne: '' } });
check('login rejects NoSQL operator injection', r.status === 400 || r.status === 401);

r = await call('POST', '/auth/login', { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
check('login succeeds', r.status === 200 && r.data?.token);
token = r.data?.token || '';
r = await call('GET', '/auth/me');
check('token works on /auth/me', r.status === 200 && r.data.admin?.username);

const initialAppearance = (await call('GET', '/admin/appearance')).data;
r = await call('GET', '/public/appearance');
check('public appearance contains published settings only', r.status === 200 && r.data.published && !('draft' in r.data));
for (const season of ['spring', 'summer', 'autumn', 'winter']) {
  r = await call('PUT', '/admin/appearance', { season });
  check(`appearance draft accepts ${season}`, r.status === 200 && r.data.draft.season === season);
}
r = await call('GET', '/admin/appearance');
check('appearance draft persists', r.status === 200 && r.data.draft.season === 'winter');
r = await call('GET', '/public/appearance');
check('draft changes do not affect public appearance', r.data.published.season === initialAppearance.published.season);
check('appearance rejects invalid season', (await call('PUT', '/admin/appearance', { season: 'monsoon' })).status === 400);
check('appearance rejects unsupported template', (await call('PUT', '/admin/appearance', { template: 'minimal' })).status === 400);
r = await call('POST', '/admin/appearance/reset');
check('appearance reset copies published settings to draft', r.status === 200 && r.data.draft.season === initialAppearance.published.season);
await call('PUT', '/admin/appearance', { season: 'autumn' });
r = await call('POST', '/admin/appearance/publish');
check('appearance publish updates published settings', r.status === 200 && r.data.published.season === 'autumn');
r = await call('GET', '/public/appearance');
check('published appearance is available publicly', r.status === 200 && r.data.published.season === 'autumn');
await call('PUT', '/admin/appearance', { season: initialAppearance.published.season });
await call('PUT', '/admin/appearance', { template: initialAppearance.published.template });
await call('POST', '/admin/appearance/publish');
await call('PUT', '/admin/appearance', { season: initialAppearance.draft.season });
await call('PUT', '/admin/appearance', { template: initialAppearance.draft.template });

const tag = Date.now();
r = await call('POST', '/admin/categories', { name: `Smoke Cat ${tag}` });
check('category create', r.status === 201);
const cat = r.data;

r = await call('POST', '/admin/projects', { title: '' });
check('project validation rejects empty title', r.status === 400);

const form = new FormData();
form.append('title', `Smoke Project ${tag}`);
form.append('category', cat._id);
form.append('summary', 'Test summary');
form.append('description', 'Test description');
form.append('technologies', 'React, Node.js');
form.append('liveUrl', 'https://example.com');
form.append('status', 'draft');
r = await call('POST', '/admin/projects', null, { form });
check('project create (draft)', r.status === 201 && r.data.slug);
const proj = r.data;

r = await call('GET', `/projects/${proj.slug}`);
check('draft is NOT public', r.status === 404);

r = await call('PATCH', `/admin/projects/${proj._id}/status`, { status: 'published', featured: true });
check('publish + feature', r.status === 200 && r.data.status === 'published');

r = await call('GET', '/public/home');
check('published project appears on public home', r.data?.projects?.some((p) => p._id === proj._id && p.featured));
r = await call('GET', `/projects/${proj.slug}`);
check('project detail page endpoint', r.status === 200 && r.data.project.technologies.length === 2);

const upd = new FormData();
upd.append('title', `Smoke Project ${tag} v2`);
upd.append('status', 'draft');
r = await call('PUT', `/admin/projects/${proj._id}`, null, { form: upd });
check('project update', r.status === 200 && r.data.title.endsWith('v2'));
r = await call('GET', '/public/home');
check('unpublish removes it from public', !r.data.projects.some((p) => p._id === proj._id));

r = await call('POST', '/admin/projects', null, { form: (() => { const f = new FormData(); f.append('title', 'x'); f.append('category', cat._id); f.append('liveUrl', 'javascript:alert(1)'); return f; })() });
check('project rejects non-http URL', r.status === 400);

r = await call('DELETE', `/admin/categories/${cat._id}`);
check('category in use cannot be deleted', r.status === 409);
r = await call('DELETE', `/admin/projects/${proj._id}`);
check('project delete', r.status === 200);
r = await call('DELETE', `/admin/categories/${cat._id}`);
check('category delete', r.status === 200);

r = await call('POST', '/admin/skills', {
  name: `Expertise ${tag}`,
  group: 'Development',
  level: 70,
  description: 'Smoke test expertise description',
  technologies: ['Tool A', 'Tool B'],
  icon: 'Code2',
  active: true,
});
check('expertise create', r.status === 201 && r.data.technologies.length === 2);
const skill = r.data;
r = await call('GET', '/public/home');
check('active expertise appears on public home', r.data?.skills?.some((item) => item._id === skill._id));
r = await call('PUT', `/admin/skills/${skill._id}`, { level: 80, description: 'Updated expertise description' });
check('expertise update', r.data.level === 80 && r.data.description === 'Updated expertise description');
r = await call('PUT', `/admin/skills/${skill._id}`, { active: false });
check('expertise deactivation', r.status === 200 && r.data.active === false);
r = await call('GET', '/public/home');
check('inactive expertise is hidden publicly', !r.data?.skills?.some((item) => item._id === skill._id));
r = await call('PUT', `/admin/skills/${skill._id}`, { active: true });
check('expertise reactivation', r.status === 200 && r.data.active === true);
r = await call('DELETE', `/admin/skills/${skill._id}`);
r = await call('GET', '/public/home');
check('deleted expertise is removed publicly', !r.data?.skills?.some((item) => item._id === skill._id));

r = await call('POST', '/admin/experience', { role: 'Test Role', startDate: '2024', current: true });
check('experience create', r.status === 201 && r.data.current === true);
check('experience delete', (await call('DELETE', `/admin/experience/${r.data._id}`)).status === 200);

const cf = new FormData();
cf.append('title', `Smoke Campaign ${tag}`);
cf.append('type', 'SEO');
cf.append('status', 'published');
cf.append('performance', JSON.stringify([{ label: 'Metric', value: '1' }, { label: '', value: '' }]));
r = await call('POST', '/admin/campaigns', null, { form: cf });
check('campaign create', r.status === 201 && r.data.performance.length === 1);
const camp = r.data;
r = await call('GET', `/campaigns/${camp.slug}`);
check('published campaign is public', r.status === 200);
check('campaign delete', (await call('DELETE', `/admin/campaigns/${camp._id}`)).status === 200);

const pf = new FormData();
pf.append('tagline', 'Smoke tagline');
pf.append('contact', JSON.stringify({ email: 'smoke@example.com' }));
pf.append('social', JSON.stringify({ github: 'https://github.com/example' }));
r = await call('PUT', '/admin/profile', null, { form: pf });
check('profile update', r.status === 200 && r.data.social.github.includes('github'));
const bad = new FormData();
bad.append('social', JSON.stringify({ github: 'not a url' }));
check('profile rejects bad social url', (await call('PUT', '/admin/profile', null, { form: bad })).status === 400);

r = await call('POST', '/contact', { name: 'Tester', email: 'bad', message: 'hello there world' });
check('contact rejects invalid email', r.status === 400);
r = await call('POST', '/contact', { name: 'Tester', email: 'test@example.com', subject: 'Hi', message: 'This is a smoke test message.' });
check('contact submit', r.status === 201);
r = await call('GET', '/admin/messages');
const msg = r.data?.find((m) => m.name === 'Tester');
check('message visible in admin', Boolean(msg));
check('mark read', (await call('PATCH', `/admin/messages/${msg._id}`, { read: true })).data.read === true);
check('delete message', (await call('DELETE', `/admin/messages/${msg._id}`)).status === 200);

r = await call('GET', '/admin/stats');
check('stats', r.status === 200 && typeof r.data.projects === 'number');

const noPdf = new FormData();
noPdf.append('resume', new Blob(['hello'], { type: 'text/plain' }), 'x.txt');
check('resume rejects non-PDF', (await call('POST', '/admin/resume', null, { form: noPdf })).status === 415);
const fakePdf = new FormData();
fakePdf.append('resume', new Blob(['not really a pdf'], { type: 'application/pdf' }), 'fake.pdf');
check('resume rejects fake PDF (magic bytes)', (await call('POST', '/admin/resume', null, { form: fakePdf })).status === 415);
r = await call('GET', '/resume/download');
console.log(`  info resume download status without upload: ${r.status} (404 expected until a PDF is uploaded)`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

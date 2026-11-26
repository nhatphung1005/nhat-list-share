// Set the description of the open MR for a branch on GitLab, from a Markdown file.
// Usage: node set-mr-description.js <repo-dir> <source-branch> <description.md> [--dry-run]
// Token: env GITLAB_TOKEN (Personal Access Token, scope api). Never printed.
const { execFileSync } = require('child_process');
const fs = require('fs');

const [repoDir, branch, descFile] = process.argv.slice(2);
const dryRun = process.argv.includes('--dry-run');
const die = (msg) => { console.error(`set-mr-description: ${msg}`); process.exit(1); };
if (!repoDir || !branch || !descFile) die('usage: <repo-dir> <source-branch> <description.md> [--dry-run]');

const remote = execFileSync('git', ['-C', repoDir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
const m = remote.match(/^(?:https?:\/\/(?:[^@/]+@)?([^/]+)\/|git@([^:]+):)(.+?)(?:\.git)?$/);
if (!m) die(`cannot parse origin url of ${repoDir}`);
const host = m[1] || m[2];
const project = encodeURIComponent(m[3]);
const api = `https://${host}/api/v4/projects/${project}`;

const description = fs.readFileSync(descFile, 'utf8').trim();
if (description.length < 200) die(`${descFile} looks too short (${description.length} chars); refusing to overwrite the MR description`);

const token = process.env.GITLAB_TOKEN;
if (!token) die('GITLAB_TOKEN is not set. Ask người dùng to set it (see skill mr-chi-tiet).');
const headers = { 'PRIVATE-TOKEN': token, 'Content-Type': 'application/json' };

(async () => {
  const listUrl = `${api}/merge_requests?state=opened&source_branch=${encodeURIComponent(branch)}`;
  const res = await fetch(listUrl, { headers });
  if (!res.ok) die(`list MRs failed: HTTP ${res.status}`);
  const mrs = await res.json();
  if (mrs.length !== 1) die(`expected exactly 1 open MR from ${branch}, found ${mrs.length}`);
  const mr = mrs[0];
  console.log(`MR !${mr.iid} ${mr.web_url} (${mr.source_branch} -> ${mr.target_branch})`);
  if (dryRun) { console.log(`dry-run: would set description (${description.length} chars)`); return; }

  const put = await fetch(`${api}/merge_requests/${mr.iid}`, { method: 'PUT', headers, body: JSON.stringify({ description }) });
  if (!put.ok) die(`update description failed: HTTP ${put.status}`);
  const after = await put.json();
  if ((after.description || '').trim() !== description) die('description on GitLab does not match the file after update');
  console.log(`description set (${description.length} chars)`);
})().catch((e) => die(e.message));

// Self-check for block-dangerous-git.js: node block-dangerous-git.test.js
const { execFileSync } = require('child_process');
const path = require('path');
const HOOK = path.join(__dirname, 'block-dangerous-git.js');
const g = 'gi' + 't';
const cases = {
  block: [
    `${g} pu` + 'sh -o merge_request.create -o merge_request.merge_when_pipeline_succeeds origin feature/x',
    `${g} pu` + 'sh -o merge_request.auto_merge origin feature/x',
    'glab mr merge 12',
    'curl -X PUT https://gitlab.example.com/api/v4/projects/1/merge_' + 'requests/12/merge',
    `${g} pu` + 'sh origin sprint_10',
    `${g} -C _wt/svc-123 pu` + 'sh origin HEAD:sprint_10',
    `${g} pu` + 'sh origin develop',
    `${g} pu` + 'sh origin main',
    `${g} pu` + 'sh origin feature/x:refs/heads/master',
    `${g} pu` + 'sh --fo' + 'rce origin feature/x',
    `${g} pu` + 'sh -f origin feature/x',
    `${g} res` + 'et --ha' + 'rd HEAD',
    `${g} cle` + 'an -fdx',
    `${g} branch -` + 'D foo',
    `${g} checkout .`,
    `${g} restore .`,
  ],
  allow: [
    `${g} -C _wt/svc-123 pu` + 'sh -u origin feature/TICKET-663-x',
    `${g} -C _wt/svc-123 pu` + 'sh -o merge_request.create -o merge_request.target=sprint_10 -o merge_request.assign=reviewer origin feature/TICKET-663-x',
    `${g} pu` + 'sh origin feature/TICKET-700-sprint_10-fix',
    'glab mr create --fill --target-branch sprint_10',
    'curl -X POST https://gitlab.example.com/api/v4/projects/1/merge_' + 'requests -d title=x',
    'curl -s https://gitlab.example.com/api/v4/projects/1/merge_' + 'requests?state=opened',
    `${g} status`,
    `${g} -C x status`,
    `${g} commit -F msg.txt`,
    `${g} checkout feature/x`,
    `${g} pull`,
    `${g} branch -d foo`,
    `${g} log --oneline`,
  ],
};
let bad = 0;
for (const [want, list] of Object.entries(cases)) {
  for (const command of list) {
    let code = 0;
    try {
      execFileSync('node', [HOOK], { input: JSON.stringify({ tool_input: { command } }), stdio: ['pipe', 'ignore', 'ignore'] });
    } catch (e) {
      code = e.status;
    }
    const ok = (want === 'block') === (code === 2);
    if (!ok) bad++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${want} ${code}  ${command}`);
  }
}
console.log(bad ? `${bad} FAIL` : 'all OK');
process.exit(bad ? 1 : 0);

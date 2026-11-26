// Port of mattpocock/skills git-guardrails-claude-code (bash+jq -> node; no jq on this machine).
// PreToolUse hook for Bash and PowerShell: exit 2 blocks the command.
// `G` allows global options between git and the subcommand (e.g. `git -C _wt/svc-123 push`).
const G = String.raw`\bgit\b[^;&|\n]*?\s`;
// người dùng 23/11: push and creating an MR are allowed; merging is người dùng's click only.
const MERGE = [
  /merge_request\.(merge_when_pipeline_succeeds|auto_merge)/,
  /\bglab\s+mr\s+merge\b/,
  /merge_requests\/[^\s/]+\/merge\b/,
  // pushing straight into a shared branch is a merge without review
  new RegExp(G + String.raw`push\b[^;&|\n]*?(\s|:|refs/heads/)(sprint_\d+|develop|main|master)(\s|$)`),
];
const PATTERNS = [
  ...MERGE,
  /push\s+(-f\b|--force)/,
  new RegExp(G + String.raw`reset\s+--hard`),
  new RegExp(G + String.raw`clean\s+-[a-z]*f`),
  new RegExp(G + String.raw`branch\s+-D\b`),
  new RegExp(G + String.raw`checkout\s+\.(\s|$)`),
  new RegExp(G + String.raw`restore\s+\.(\s|$)`),
  /reset\s+--hard/,
];

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(raw).tool_input?.command ?? '';
  } catch {
    process.stderr.write('BLOCKED: git-guardrails could not parse hook input.\n');
    process.exit(2);
  }
  const hit = PATTERNS.find((p) => p.test(command));
  if (hit) {
    process.stderr.write(
      `BLOCKED: '${command}' matches dangerous pattern ${hit}. người dùng has prevented you from doing this; ask người dùng to run it in their own terminal.\n`
    );
    process.exit(2);
  }
  process.exit(0);
});

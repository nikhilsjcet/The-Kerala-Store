import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read arguments: token, owner, repo
const token = process.env.GITHUB_TOKEN || process.argv[2];
const repoInput = process.env.GITHUB_REPO || process.argv[3]; // format: owner/repo or full url

if (!token || !repoInput) {
  console.error('Usage: node scripts/push_to_github.mjs <GITHUB_TOKEN> <OWNER/REPO or GITHUB_URL>');
  process.exit(1);
}

// Clean repo name
let repoPath = repoInput.replace('https://github.com/', '').replace(/\.git$/, '').trim();
const [owner, repo] = repoPath.split('/');

if (!owner || !repo) {
  console.error('Invalid repository format. Expected: username/repo-name');
  process.exit(1);
}

const IGNORE_DIRS = new Set(['node_modules', 'dist', 'dist-ssr', '.git', '.gemini', 'scratch']);
const IGNORE_FILES = new Set(['.env', '.env.local', 'package-lock.json.bak']);

function getAllFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (IGNORE_DIRS.has(item) || item.startsWith('.DS_Store')) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      if (!IGNORE_FILES.has(item)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

async function githubRequest(endpoint, method = 'GET', body = null) {
  const url = `https://api.github.com/repos/${owner}/${repo}${endpoint}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'TheKeralaStore-Pusher'
  };
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status}): ${json.message || text}`);
  }
  return json;
}

async function run() {
  console.log(`🚀 Preparing to push to https://github.com/${owner}/${repo}...`);

  // 1. Check repo exists
  try {
    await githubRequest('');
    console.log(`✅ Repository ${owner}/${repo} found!`);
  } catch (e) {
    console.error(`❌ Could not access repo: ${e.message}`);
    process.exit(1);
  }

  // 2. Collect all files
  const files = getAllFiles(rootDir);
  console.log(`📦 Found ${files.length} project files to upload.`);

  // 3. Upload blobs
  const treeItems = [];
  let uploaded = 0;

  for (const file of files) {
    const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file);
    const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|svg|woff|woff2|ttf|eot)$/i.test(file);

    const blobData = await githubRequest('/git/blobs', 'POST', {
      content: content.toString(isBinary ? 'base64' : 'utf8'),
      encoding: isBinary ? 'base64' : 'utf-8'
    });

    treeItems.push({
      path: relPath,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha
    });

    uploaded++;
    if (uploaded % 10 === 0 || uploaded === files.length) {
      console.log(`📤 Processed ${uploaded}/${files.length} files...`);
    }
  }

  // 4. Create Tree
  console.log(`🌳 Creating Git Tree...`);
  const tree = await githubRequest('/git/trees', 'POST', {
    tree: treeItems
  });

  // 5. Check if main branch exists to get parent commit
  let parentCommitSha = null;
  try {
    const ref = await githubRequest('/git/refs/heads/main');
    parentCommitSha = ref.object.sha;
  } catch {
    // Branch might not exist yet if fresh empty repo
  }

  // 6. Create Commit
  console.log(`💾 Creating Commit...`);
  const commit = await githubRequest('/git/commits', 'POST', {
    message: process.env.COMMIT_MSG || 'Fix Google OAuth login only, isolate cart state, scope orders to customer user_id, and update official Kerala Cart favicon',
    tree: tree.sha,
    parents: parentCommitSha ? [parentCommitSha] : []
  });

  // 7. Update or Create Ref
  console.log(`📌 Updating main branch to point to new commit...`);
  if (parentCommitSha) {
    await githubRequest('/git/refs/heads/main', 'PATCH', {
      sha: commit.sha,
      force: true
    });
  } else {
    await githubRequest('/git/refs', 'POST', {
      ref: 'refs/heads/main',
      sha: commit.sha
    });
  }

  console.log(`\n🎉 SUCCESS! Your code has been pushed to:`);
  console.log(`👉 https://github.com/${owner}/${repo}\n`);
}

run().catch((err) => {
  console.error('Push failed:', err.message);
  process.exit(1);
});

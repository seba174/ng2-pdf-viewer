const { SchematicsException } = require('@angular-devkit/schematics');

const PDFJS_ASSETS = [
  {
    glob: 'pdf.worker.min.mjs',
    input: 'node_modules/pdfjs-dist/legacy/build',
    output: 'assets/pdfjs/legacy/build'
  },
  {
    glob: '**/*',
    input: 'node_modules/pdfjs-dist/cmaps',
    output: 'assets/pdfjs/cmaps'
  },
  {
    glob: '**/*',
    input: 'node_modules/pdfjs-dist/web/images',
    output: 'assets/pdfjs/web/images'
  }
];

function ngAdd(options = {}) {
  return (tree, context) => {
    const workspacePath = getWorkspacePath(tree);
    const workspace = readWorkspace(tree, workspacePath);
    const projectName = options.project || workspace.defaultProject || findDefaultProjectName(workspace);
    const project = workspace.projects && workspace.projects[projectName];

    if (!projectName || !project) {
      throw new SchematicsException('Could not find an Angular project to configure.');
    }

    const buildUpdated = addAssetsToTarget(project, 'build');
    addAssetsToTarget(project, 'test');

    if (!buildUpdated) {
      throw new SchematicsException(`Project "${projectName}" does not have a build target.`);
    }

    tree.overwrite(workspacePath, JSON.stringify(workspace, null, 2) + '\n');

    context.logger.info(`Configured PDF.js assets for project "${projectName}".`);
    return tree;
  };
}

function getWorkspacePath(tree) {
  if (tree.exists('/angular.json')) {
    return '/angular.json';
  }

  if (tree.exists('angular.json')) {
    return 'angular.json';
  }

  throw new SchematicsException('Could not find angular.json in this workspace.');
}

function readWorkspace(tree, workspacePath) {
  const buffer = tree.read(workspacePath);

  if (!buffer) {
    throw new SchematicsException(`Could not read ${workspacePath}.`);
  }

  try {
    return JSON.parse(buffer.toString('utf-8'));
  } catch (error) {
    throw new SchematicsException(`Could not parse ${workspacePath}: ${error.message}`);
  }
}

function findDefaultProjectName(workspace) {
  const projects = workspace.projects || {};
  const entries = Object.entries(projects);
  const appEntry = entries.find(([, project]) => project && project.projectType === 'application');

  return (appEntry || entries[0] || [undefined])[0];
}

function addAssetsToTarget(project, targetName) {
  const target = getTarget(project, targetName);

  if (!target) {
    return false;
  }

  target.options = target.options || {};

  const assets = Array.isArray(target.options.assets)
    ? target.options.assets
    : [];

  for (const asset of PDFJS_ASSETS) {
    if (!assets.some(existingAsset => isSameAsset(existingAsset, asset))) {
      assets.push({ ...asset });
    }
  }

  target.options.assets = assets;
  return true;
}

function getTarget(project, targetName) {
  const targets = project.architect || project.targets || {};

  return targets[targetName];
}

function isSameAsset(existingAsset, asset) {
  return (
    existingAsset &&
    typeof existingAsset === 'object' &&
    normalizePath(existingAsset.glob) === normalizePath(asset.glob) &&
    normalizePath(existingAsset.input) === normalizePath(asset.input) &&
    normalizePath(existingAsset.output) === normalizePath(asset.output)
  );
}

function normalizePath(path) {
  return String(path || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

module.exports = {
  ngAdd
};

const { SchematicsException } = require('@angular-devkit/schematics');

const PACKAGE_ASSET_ROOT = 'node_modules/@seba174/ng2-pdf-viewer/assets/pdfjs';

const PDFJS_ASSETS = [
  {
    glob: 'pdf.worker.min.mjs',
    input: `${PACKAGE_ASSET_ROOT}/legacy/build`,
    output: 'assets/pdfjs/legacy/build'
  },
  {
    glob: '**/*',
    input: `${PACKAGE_ASSET_ROOT}/cmaps`,
    output: 'assets/pdfjs/cmaps'
  },
  {
    glob: '**/*',
    input: `${PACKAGE_ASSET_ROOT}/web/images`,
    output: 'assets/pdfjs/web/images'
  }
];

const MJS_MIME_MAP_ENTRY_LINES = [
  '      <remove fileExtension=".mjs" />',
  '      <mimeMap fileExtension=".mjs" mimeType="text/javascript" />'
];

const MJS_MIME_MAP_BLOCK_LINES = [
  '    <staticContent>',
  ...MJS_MIME_MAP_ENTRY_LINES,
  '    </staticContent>'
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

    const updatedWebConfigPaths = configureIisWebConfigs(tree, project);

    tree.overwrite(workspacePath, JSON.stringify(workspace, null, 2) + '\n');

    if (updatedWebConfigPaths.length > 0) {
      context.logger.info(`Configured IIS .mjs MIME type in ${updatedWebConfigPaths.join(', ')}.`);
    }

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

function configureIisWebConfigs(tree, project) {
  const target = getTarget(project, 'build');
  const assets = target && target.options && Array.isArray(target.options.assets)
    ? target.options.assets
    : [];
  const webConfigPaths = findWebConfigPaths(assets);
  const updatedPaths = [];

  for (const webConfigPath of webConfigPaths) {
    if (addMjsMimeMapToWebConfig(tree, webConfigPath)) {
      updatedPaths.push(webConfigPath.replace(/^\/+/, ''));
    }
  }

  return updatedPaths;
}

function findWebConfigPaths(assets) {
  const paths = [];

  for (const asset of assets) {
    const webConfigPath = getWebConfigPath(asset);

    if (webConfigPath && !paths.includes(webConfigPath)) {
      paths.push(webConfigPath);
    }
  }

  return paths;
}

function getWebConfigPath(asset) {
  if (typeof asset === 'string') {
    const normalizedAsset = normalizePath(asset);

    return normalizedAsset.endsWith('/web.config') || normalizedAsset === 'web.config'
      ? toTreePath(normalizedAsset)
      : undefined;
  }

  if (!asset || typeof asset !== 'object') {
    return undefined;
  }

  const glob = normalizePath(asset.glob);
  const input = normalizePath(asset.input);

  return glob === 'web.config' && input
    ? toTreePath(`${input}/web.config`)
    : undefined;
}

function addMjsMimeMapToWebConfig(tree, webConfigPath) {
  if (!tree.exists(webConfigPath)) {
    return false;
  }

  const buffer = tree.read(webConfigPath);

  if (!buffer) {
    return false;
  }

  const content = buffer.toString('utf-8');

  if (hasMjsMimeMap(content)) {
    return false;
  }

  const updatedContent = addMjsMimeMapToSystemWebServer(content);

  if (updatedContent === content) {
    return false;
  }

  tree.overwrite(webConfigPath, updatedContent);
  return true;
}

function hasMjsMimeMap(content) {
  return /<mimeMap\b[^>]*fileExtension=["']\.mjs["']/i.test(content);
}

function addMjsMimeMapToSystemWebServer(content) {
  const systemWebServerMatch = findRootSystemWebServerMatch(content);

  if (!systemWebServerMatch) {
    return content;
  }

  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  const sectionStart = systemWebServerMatch.index + systemWebServerMatch[0].length;
  const sectionEnd = content.indexOf('</system.webServer>', sectionStart);

  if (sectionEnd === -1) {
    return content;
  }

  const sectionContent = content.slice(sectionStart, sectionEnd);
  const staticContentMatch = sectionContent.match(/<staticContent>/i);

  if (staticContentMatch) {
    const insertAt = sectionStart + staticContentMatch.index + staticContentMatch[0].length;

    return `${content.slice(0, insertAt)}${newline}${MJS_MIME_MAP_ENTRY_LINES.join(newline)}${content.slice(insertAt)}`;
  }

  return `${content.slice(0, sectionStart)}${newline}${MJS_MIME_MAP_BLOCK_LINES.join(newline)}${content.slice(sectionStart)}`;
}

function findRootSystemWebServerMatch(content) {
  const systemWebServerMatches = [...content.matchAll(/<system\.webServer>/gi)];

  return systemWebServerMatches.find(match => !isInsideLocation(content, match.index));
}

function isInsideLocation(content, index) {
  const beforeIndex = content.slice(0, index);
  const openedLocations = beforeIndex.match(/<location\b/gi) || [];
  const closedLocations = beforeIndex.match(/<\/location>/gi) || [];

  return openedLocations.length > closedLocations.length;
}

function toTreePath(path) {
  return `/${normalizePath(path)}`;
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

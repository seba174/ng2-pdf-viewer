# Changelog

## 21.0.1 - 07.05.2026

- Load PDF.js worker, cMaps, and viewer image assets from same-origin app assets by default instead of CDN URLs.
- Document the required Angular asset copy configuration for CSP-compatible deployments.
- Move the library source into `projects/ng2-pdf-viewer` so the demo app no longer owns the package code.
- Add an Angular `ng add` schematic that configures PDF.js worker, cMap, and viewer image assets.
- Add `providePdfViewer()` for Angular-native worker, cMap, and viewer image path configuration.
- Remove the top-level `Promise.withResolvers` global polyfill from the library module.
- Switch the development toolchain to TypeScript 6.0 and Node.js 24 CI.
- Remove checked-in generated GitHub Pages docs output.

## 21.0.0 - 17.04.2026

- Publish the fork as `@seba174/ng2-pdf-viewer`.
- Set Angular 21 as the minimum supported Angular version.
- Ship `PdfViewerComponent` as a standalone component.
- Migrate public inputs and outputs to Angular signal APIs.
- Upgrade PDF.js integration to `pdfjs-dist` 5.x.
- Add zoneless-compatible Angular support.
- Use Angular CLI esbuild tooling and `angular-eslint`.

### Breaking Changes

- Angular 21 or newer is required.
- `PdfViewerModule` has been removed; import `PdfViewerComponent` directly.
- Component inputs use signal `input()` APIs.
- Component outputs use Angular `output()` APIs.

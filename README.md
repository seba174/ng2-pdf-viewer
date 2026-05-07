<h1 align="center">Angular PDF Viewer</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/@seba174/ng2-pdf-viewer">
    <img src="https://img.shields.io/npm/dm/%40seba174%2Fng2-pdf-viewer.svg?style=flat" alt="downloads">
  </a>
  <a href="https://www.npmjs.com/package/@seba174/ng2-pdf-viewer">
    <img src="https://img.shields.io/npm/v/%40seba174%2Fng2-pdf-viewer.svg" alt="npm version">
  </a>
</p>

> PDF Viewer Component for Angular 21+ (standalone)

### Maintenance

This fork continues the original API surface with current Angular and pdf.js tooling.

## Overview

* [Install](#install)
* [Requirements](#requirements)
* [PDF.js assets](#pdfjs-assets)
* [Configuration](#configuration)
* [Usage](#usage)
* [Zoneless support](#zoneless-support)
* [Options](#options)
* [Render local PDF file](#render-local-pdf-file)
* [Search in the PDF](#search-in-the-pdf)
* [Contribute](#contribute)

## Install

### Angular >= 21
```
npm install @seba174/ng2-pdf-viewer
```
> Standalone component, signal-based inputs/outputs, ships with FESM2022 bundles.

## Requirements

- Angular 21.0.0 or newer.
- Node 22.13+ / 24+.
- Modern browsers supported by Angular 21 and `pdfjs-dist` 5.x.

## PDF.js assets

The viewer uses same-origin PDF.js assets by default. No CDN URLs are loaded by the library.

Run the Angular schematic to configure the worker, cMaps, and viewer images:

```bash
ng add @seba174/ng2-pdf-viewer
```

If you configure assets manually, add these entries to the build target's `assets` array:

```json
{
  "glob": "pdf.worker.min.mjs",
  "input": "node_modules/pdfjs-dist/legacy/build",
  "output": "assets/pdfjs/legacy/build"
},
{
  "glob": "**/*",
  "input": "node_modules/pdfjs-dist/cmaps",
  "output": "assets/pdfjs/cmaps"
},
{
  "glob": "**/*",
  "input": "node_modules/pdfjs-dist/web/images",
  "output": "assets/pdfjs/web/images"
}
```

The default runtime paths are resolved against the document base URL:

- worker: `assets/pdfjs/legacy/build/pdf.worker.min.mjs`
- cMaps: `assets/pdfjs/cmaps/`
- viewer images: `assets/pdfjs/web/images/`

## Configuration

Most applications do not need runtime configuration. If your app serves PDF.js assets from a different path, configure the viewer once during bootstrap:

```typescript
import { providePdfViewer } from '@seba174/ng2-pdf-viewer';

bootstrapApplication(AppComponent, {
  providers: [
    providePdfViewer({
      workerSrc: '/static/pdfjs/pdf.worker.min.mjs',
      cMapsUrl: '/static/pdfjs/cmaps/',
      imageResourcesPath: '/static/pdfjs/web/images/'
    })
  ]
});
```

Relative values are resolved against the document base URL.

## Usage

Add `PdfViewerComponent` to the `imports` array of the standalone component where you want to render a PDF.

```typescript
import { Component } from '@angular/core';
import { PdfViewerComponent } from '@seba174/ng2-pdf-viewer';

@Component({
  selector: 'example-app',
  imports: [PdfViewerComponent],
  template: `
    <pdf-viewer
      [src]="pdfSrc"
      [render-text]="true"
      [original-size]="false"
      style="width: 400px; height: 500px"
    />
  `
})
export class AppComponent {
  pdfSrc = "./assets/pdf-test.pdf";
}
```

## Zoneless support

`PdfViewerComponent` works in both zone-based and zoneless host applications. The component has no reactive template bindings — its template is a single container `<div>` and all rendering is delegated to pdf.js's imperative DOM API. Outputs go through `output()` signals, which automatically mark consumer components dirty.

Zoneless consumers can bootstrap as usual:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection()]
}).catch(err => console.error(err));
```

No additional configuration is required on the library side.

## Options

* [[src]](#src)
* [[(page)]](#page)
* [[stick-to-page]](#stick-to-page)
* [[external-link-target]](#external-link-target)
* [[render-text]](#render-text)
* [[render-text-mode]](#render-text-mode)
* [[rotation]](#rotation)
* [[zoom]](#zoom)
* [[zoom-scale]](#zoom-scale)
* [[original-size]](#original-size)
* [[fit-to-page]](#fit-to-page)
* [[show-all]](#show-all)
* [[autoresize]](#autoresize)
* [[c-maps-url]](#c-maps-url)
* [[show-borders]](#show-borders)
* [(after-load-complete)](#after-load-complete)
* [(page-rendered)](#page-rendered)
* [(pages-initialized)](#pages-initialized)
* [(text-layer-rendered)](#text-layer-rendered)
* [(error)](#error)
* [(on-progress)](#on-progress)

#### [src]

| Property | Type | Required |
| --- | ---- | --- |
| [src] | *string, object, Uint8Array* | Required |

Pass pdf location

```
[src]="'./assets/pdf-test.pdf'"
```

For more control you can pass options object to ```[src]```. [See other attributes for the object here](https://github.com/mozilla/pdf.js/blob/master/src/display/api.js#L130-L222).

Options object for loading protected PDF would be:

 ```js
 {
  url: './assets/pdf-test.pdf',
  withCredentials: true
 }
 ```

#### [page]


| Property | Type | Required |
| --- | ---- | --- |
| [page] or [(page)] | *number* | *Required* with [show-all]="false" or *Optional* with [show-all]="true" |

Page number

```
[page]="1"
```
supports two way data binding as well
```
[(page)]="pageVariable"
```

If you want that the `two way data binding` actually updates your `page` variable on page change/scroll - you have to be sure that you define the height of the container, for example:
```css
pdf-viewer {
    height: 100vh;
}
```

#### [stick-to-page]

| Property | Type | Required |
| --- | ---- | --- |
| [stick-to-page] | *boolean* | *Optional* |

Sticks view to the page. Works in combination with `[show-all]="true"` and `page`.

```
[stick-to-page]="true"
```

#### [render-text]

| Property | Type | Required |
| --- | ---- | --- |
| [render-text] | *boolean* | *Optional* |

Enable text rendering, allows to select text
```
[render-text]="true"
```

#### [render-text-mode]

| Property | Type | Required |
| --- | ---- | --- |
| [render-text-mode] | *RenderTextMode* | *Optional* |

Used in combination with `[render-text]="true"`

Controls if the text layer is enabled, and the selection mode that is used.

`0 = RenderTextMode.DISABLED` - disable the text selection layer

`1 = RenderTextMode.ENABLED` - enables the text selection layer

`2 = RenderTextMode.ENHANCED` - enables enhanced text selection

```
[render-text-mode]="1"
```

#### [external-link-target]

| Property | Type | Required |
| --- | ---- | --- |
| [external-link-target] | *string* | *Optional* |

Used in combination with `[render-text]="true"`

Link target
* `blank`
* `none`
* `self`
* `parent`
* `top`
```
[external-link-target]="'blank'"
```

#### [rotation]

| Property | Type | Required |
| --- | ---- | --- |
| [rotation] | *number* | *Optional* |

Rotate PDF

*Allowed step is 90 degree, ex. 0, 90, 180*
```
[rotation]="90"
```

#### [zoom]

| Property | Type | Required |
| --- | ---- | --- |
| [zoom] | *number* | *Optional* |

Zoom pdf
```
[zoom]="0.5"
```

#### [zoom-scale]

| Property | Type | Required |
| --- | ---- | --- |
| [zoom-scale] | *'page-width'\|'page-fit'\|'page-height'* | *Optional* |

Defines how the Zoom scale is computed when  `[original-size]="false"`, by default set to 'page-width'.

- *'page-width'* with zoom of 1 will display a page width that take all the possible horizontal space in the container

- *'page-height'* with zoom of 1 will display a page height that take all the possible vertical space in the container

- *'page-fit'* with zoom of 1 will display a page that will be scaled to either width or height to fit completely in the container

```
[zoom-scale]="'page-width'"
```

#### [original-size]

| Property | Type | Required |
| --- | ---- | --- |
| [original-size] | *boolean* | *Optional* |

* if set to *true* - size will be as same as original document
* if set to *false* - size will be as same as container block

```
[original-size]="true"
```

#### [fit-to-page]

| Property | Type | Required |
| --- | ---- | --- |
| [fit-to-page] | *boolean* | *Optional* |

Works in combination with `[original-size]="true"`. You can show your document in original size, and make sure that it's not bigger then container block.

```
[fit-to-page]="false"
```

#### [show-all]

| Property | Type | Required |
| --- | ---- | --- |
| [show-all] | *boolean* | *Optional* |

Show single or all pages altogether

```
[show-all]="true"
```

#### [autoresize]

| Property | Type | Required |
| --- | ---- | --- |
| [autoresize] | *boolean* | *Optional* |

Turn on or off auto resize.

**!Important** To make `[autoresize]` work - make sure that `[original-size]="false"` and `pdf-viewer` tag has `max-width` or `display` are set.

```
[autoresize]="true"
```

#### [c-maps-url]

| Property | Type | Required |
| --- | ---- | --- |
| [c-maps-url] | *string* | Optional |

Url for non-latin characters source maps.
```
[c-maps-url]="'assets/pdfjs/cmaps/'"
```

Default url is `assets/pdfjs/cmaps/`, resolved against the document base URL. You can also set the application default with `providePdfViewer({ cMapsUrl })`.

To use a different path, copy `node_modules/pdfjs-dist/cmaps` to your chosen assets folder and pass that path to `[c-maps-url]`.

### [show-borders]

| Property | Type | Required |
| --- | ---- | --- |
| [show-borders] | *boolean* | Optional |

Show page borders
```
[show-borders]="true"
```

#### (after-load-complete)

| Property | Type | Required |
| --- | ---- | --- |
| (after-load-complete) | *callback* | *Optional* |

Get PDF information with callback

First define callback function "callBackFn" in your controller,
```typescript
callBackFn(pdf: PDFDocumentProxy) {
   // do anything with "pdf"
}
```

And then use it in your template:
```
(after-load-complete)="callBackFn($event)"
```

#### (page-rendered)

| Property | Type | Required |
| --- | ---- | --- |
| (page-rendered) | *callback* | *Optional* |

Get event when a page is rendered. Called for every page rendered.

Define callback in your component:

```typescript
pageRendered(e: CustomEvent) {
  console.log('(page-rendered)', e);
}
```

And then bind it to `<pdf-viewer>`:

```angular2html
(page-rendered)="pageRendered($event)"
```

#### (pages-initialized)

| Property | Type | Required |
| --- | ---- | --- |
| (pages-initialized) | *callback* | *Optional* |

Get event when the pages are initialized.

Define callback in your component:

```typescript
pageInitialized(e: CustomEvent) {
  console.log('(pages-initialized)', e);
}
```

And then bind it to `<pdf-viewer>`:

```angular2html
(pages-initialized)="pageInitialized($event)"
```

#### (text-layer-rendered)

| Property | Type | Required |
| --- | ---- | --- |
| (text-layer-rendered) | *callback* | *Optional* |

Get event when a text layer is rendered.

Define callback in your component:

```typescript
textLayerRendered(e: CustomEvent) {
  console.log('(text-layer-rendered)', e);
}
```

And then bind it to `<pdf-viewer>`:

```angular2html
(text-layer-rendered)="textLayerRendered($event)"
```

#### (error)

| Property | Type | Required |
| --- | ---- | --- |
| (error) | *callback* | *Optional* |

Error handling callback

Define callback in your component's class

```typescript
onError(error: any) {
  // do anything
}
```

Then add it to `pdf-component` in component's template

```html
(error)="onError($event)"
```

#### (on-progress)

| Property | Type | Required |
| --- | ---- | --- |
| (on-progress) | *callback* | *Optional* |

Loading progress callback - provides progress information `total` and `loaded` bytes. Is called several times during pdf loading phase.

Define callback in your component's class

```typescript
onProgress(progressData: PDFProgressData) {
  // do anything with progress data. For example progress indicator
}
```

Then add it to `pdf-component` in component's template

```html
(on-progress)="onProgress($event)"
```

## Render local PDF file

In your `html` template add `input`:

```html
<input (change)="onFileSelected()" type="file" id="file">
```

and then add `onFileSelected` method to your component:

```typescript
onFileSelected() {
  let $img: any = document.querySelector('#file');

  if (typeof (FileReader) !== 'undefined') {
    let reader = new FileReader();

    reader.onload = (e: any) => {
      this.pdfSrc = e.target.result;
    };

    reader.readAsArrayBuffer($img.files[0]);
  }
}
```

## Search in the PDF

Use `eventBus` for the search functionality.

In your component's ts file:

* Add a signal `viewChild()` reference to `pdf-viewer`,
* then when needed execute `search()` like this:

```typescript
import { Component, viewChild } from '@angular/core';
import { PdfViewerComponent } from '@seba174/ng2-pdf-viewer';

@Component({ /* ... */ })
export class AppComponent {
  private readonly pdfComponent = viewChild(PdfViewerComponent);

  search(stringToSearch: string) {
    this.pdfComponent()?.eventBus.dispatch('find', {
      query: stringToSearch, type: 'again', caseSensitive: false, findPrevious: undefined, highlightAll: true, phraseSearch: true
    });
  }
}
```

> The legacy `@ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent;` decorator form still works but `viewChild()` is the modern API and matches Angular's signal direction.

## Contribute
[See CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](https://tldrlegal.com/license/mit-license)


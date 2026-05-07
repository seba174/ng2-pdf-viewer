import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface PdfViewerConfig {
  workerSrc?: string;
  cMapsUrl?: string;
  imageResourcesPath?: string;
}

export const PDF_VIEWER_CONFIG = new InjectionToken<PdfViewerConfig>(
  'PDF_VIEWER_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({})
  }
);

export function providePdfViewer(config: PdfViewerConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PDF_VIEWER_CONFIG,
      useValue: config
    }
  ]);
}

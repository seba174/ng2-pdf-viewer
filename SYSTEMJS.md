In your ```system.config.js```

Append to ```map```

```js
var map = {
    '@seba174/ng2-pdf-viewer': 'node_modules/@seba174/ng2-pdf-viewer/bundles',
    'pdfjs-dist': 'node_modules/pdfjs-dist'
}
```

and then add to ```packages```

```js
var packages = {
    '@seba174/ng2-pdf-viewer': { defaultExtension: 'js', format: 'cjs' },
    'pdfjs-dist': { defaultExtension: 'js' }
}
```

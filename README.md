# rehype-starry-night-copy-collapse

Rehype plugin to copy and collapse code blocks

![](screenshot.png)

Tested on `"astro": "^1.5.2"`

## Install

```bash
yarn add -D rehype-starry-night-copy-collapse
# or
npm i -D rehype-starry-night-copy-collapse
```

## Usage

### Using with Astro

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import rehypeStarryNightCopyCollapse from "rehype-starry-night-copy-collapse";

// https://astro.build/config
export default defineConfig({
  markdown: {
    extendDefaultPlugins: true,
    rehypePlugins: [rehypeStarryNightCopyCollapse],
    syntaxHighlight: false,
  },
});
```

### Adding global styles

```css
/* HIGHLIGHT GENERAL */
.highlight {
  position: relative;
}

/* COLLAPSE BUTTONS */
.source-highlight-wrapper.source-show-compacted .source-expanded {
  display: none;
}

.source-highlight-wrapper.source-show-compacted .source-compacted {
  display: block;
}

.source-highlight-wrapper.source-show-expanded .source-compacted {
  display: none;
}

.source-highlight-wrapper.source-show-expanded .source-expanded {
  display: block;
}

.source-highlight-wrapper .source-show-more,
.source-highlight-wrapper .source-show-less {
  user-select: none;
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 300;
  cursor: pointer;
  background-color: #222222;
  padding: 7px 10px;
  border-radius: 8px;
  margin-bottom: 7px;
  margin-right: 7px;
}

/* COPY BUTTON */
.highlight .source-copy {
  user-select: none;
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 300;
  cursor: pointer;
  background-color: #222222;
  padding: 7px 10px;
  border-radius: 8px;
  margin-top: 7px;
  margin-right: 7px;
}

.highlight:hover .source-copy {
  display: inline;
}
```

## License

[MIT](/license) © [Marat Dospolov](https://dospolov.com)
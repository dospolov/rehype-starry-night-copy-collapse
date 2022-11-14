import { createStarryNight, common } from "@wooorm/starry-night";
import sourcePS from "@wooorm/starry-night/lang/source.powershell.js";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";

export default function rehypeStarryNightCopyCollapse() {
  const grammars = [...common, sourcePS];

  const starryNightPromise = createStarryNight(grammars);

  return async function (tree) {
    const starryNight = await starryNightPromise;

    visit(tree, "element", (node, index, parent) =>
      addStarryNight(starryNight, node, index, parent)
    );
  };
}

function addStarryNight(starryNight, node, index, parent) {
  if (!parent || index === null || node.tagName !== "pre") {
    return;
  }

  const prefix = "language-";
  const head = node.children[0];

  if (
    !head ||
    head.type !== "element" ||
    head.tagName !== "code" ||
    !head.properties
  ) {
    return;
  }

  const classes = head.properties.className;

  if (!Array.isArray(classes)) return;

  const language = classes.find(
    (d) => typeof d === "string" && d.startsWith(prefix)
  );

  if (typeof language !== "string") return;

  const scope = starryNight.flagToScope(language.slice(prefix.length));

  // Maybe warn?
  if (!scope) return;

  const stringContent = toString(head);
  const stringCount = (stringContent.match(/\n/g) || "").length + 1;
  const expandable = stringCount > 5;

  if (expandable) {
    attachHighlightWithToggler(
      starryNight,
      stringContent,
      parent,
      scope,
      index
    );
  } else {
    attachHighlight(starryNight, stringContent, parent, scope, index);
  }
}

function attachHighlightWithToggler(
  starryNight,
  stringContent,
  parent,
  scope,
  index
) {
  const preChildrenCompacted = starryNight.highlight(
    getCompactedString(stringContent),
    scope
  ).children;
  const preChildrenExpanded = starryNight.highlight(
    stringContent,
    scope
  ).children;

  parent.children.splice(index, 1, {
    type: "element",
    tagName: "div",
    properties: {
      className: ["source-highlight-wrapper", "source-show-compacted"],
    },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: getHighlightClassName(scope, ["source-compacted"]),
        children: [
          getSourceRaw(stringContent),
          getCopyBtn(),
          getExpandBtn(),
          getPre(preChildrenCompacted),
        ],
      },
      {
        type: "element",
        tagName: "div",
        properties: getHighlightClassName(scope, ["source-expanded"]),
        children: [
          getSourceRaw(stringContent),
          getCopyBtn(),
          getCollapseBtn(),
          getPre(preChildrenExpanded),
        ],
      },
    ],
  });
}

function attachHighlight(starryNight, stringContent, parent, scope, index) {
  const preChildren = starryNight.highlight(stringContent, scope).children;

  parent.children.splice(index, 1, {
    type: "element",
    tagName: "div",
    properties: getHighlightClassName(scope),
    children: [getSourceRaw(stringContent), getCopyBtn(), getPre(preChildren)],
  });
}

// helpers

function getCompactedString(stringContent) {
  const COMPACT_AFTER = 5;

  return stringContent
    .split("\n")
    .filter((_, i) => i <= COMPACT_AFTER)
    .join("\n");
}

function getHighlightClassName(scope, customClassName = []) {
  return {
    className: [
      "highlight",
      "highlight-" + scope.replace(/^source\./, "").replace(/\./g, "-"),
      ...customClassName,
    ],
  };
}

function getCopyBtn() {
  function handleCopy(e) {
    const source =
      e.target.parentElement.querySelector(".source-raw").innerHTML;
    navigator.clipboard.writeText(source).then(() => {
      e.target.classList.add("copied");
      e.target.innerHTML = "Copied";
      setTimeout(() => {
        e.target.classList.remove("copied");
        e.target.innerHTML = "Copy";
      }, 2000);
    });

    return false;
  }

  return {
    type: "element",
    tagName: "span",
    properties: {
      className: ["source-copy"],
      onClick: `${handleCopy.toString()}; handleCopy(arguments[0]); return false;`,
    },
    children: [{ type: "text", value: "Copy" }],
  };
}

function getSourceRaw(stringContent) {
  const sourceRaw = {
    type: "element",
    tagName: "div",
    properties: { className: ["source-raw"], style: "display: none" },
    children: [{ type: "text", value: stringContent }],
  };
  return sourceRaw;
}

function getPre(children) {
  return { type: "element", tagName: "pre", properties: {}, children };
}

function getExpandBtn() {
  function handleShowMore(e) {
    const wrapper = e.target.parentElement.parentElement;
    wrapper.classList.remove("source-show-compacted");
    wrapper.classList.add("source-show-expanded");

    return false;
  }

  return {
    type: "element",
    tagName: "span",
    properties: {
      className: ["source-show-more"],
      onClick: `${handleShowMore.toString()}; handleShowMore(arguments[0]); return false;`,
    },
    children: [{ type: "text", value: "Show more" }],
  };
}

function getCollapseBtn() {
  function handleShowLess(e) {
    const wrapper = e.target.parentElement.parentElement;
    wrapper.classList.remove("source-show-expanded");
    wrapper.classList.add("source-show-compacted");

    return false;
  }

  return {
    type: "element",
    tagName: "span",
    properties: {
      className: ["source-show-less"],
      onClick: `${handleShowLess.toString()}; handleShowLess(arguments[0]); return false;`,
    },
    children: [{ type: "text", value: "Show less" }],
  };
}

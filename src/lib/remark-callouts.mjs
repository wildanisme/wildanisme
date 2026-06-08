  const calloutLabels = {
  note: "NOTE",
  tip: "TIP",
  important: "IMPORTANT",
  warning: "WARNING",
  caution: "CAUTION"
};

function visit(node, callback) {
  callback(node);

  if (!Array.isArray(node.children)) return;
  node.children.forEach((child) => visit(child, callback));
}

function extractMarker(paragraph) {
  const firstText = paragraph?.children?.find((child) => child.type === "text");
  if (!firstText?.value) return undefined;

  const match = firstText.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i);
  if (!match) return undefined;

  firstText.value = firstText.value.slice(match[0].length);
  paragraph.children = paragraph.children.filter((child) => child.type !== "text" || child.value.length > 0);

  return match[1].toLowerCase();
}

export default function remarkCallouts() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "blockquote") return;

      const firstParagraph = node.children?.find((child) => child.type === "paragraph");
      const type = extractMarker(firstParagraph);
      if (!type) return;

      node.data = {
        ...node.data,
        hName: "aside",
        hProperties: {
          className: ["callout", `callout-${type}`],
          "data-callout": type
        }
      };

      node.children.unshift({
        type: "paragraph",
        data: {
          hProperties: {
            className: ["callout-title"]
          }
        },
        children: [
          {
            type: "strong",
            children: [{ type: "text", value: calloutLabels[type] }]
          }
        ]
      });
    });
  };
}

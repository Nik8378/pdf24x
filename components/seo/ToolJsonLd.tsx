interface ToolJsonLdProps {
  name: string;
  description: string;
  url: string;
  category?: string;
}

export function ToolJsonLd({ name, description, url, category = "Utility" }: ToolJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        "url": url,
        "name": name,
        "description": description,
        "isPartOf": { "@id": "https://pdf24x.com" },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pdf24x.com" },
            { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://pdf24x.com/tools" },
            { "@type": "ListItem", "position": 3, "name": name, "item": url }
          ]
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": name,
        "description": description,
        "url": url,
        "applicationCategory": `${category}Application`,
        "operatingSystem": "Web Browser",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "PDF24X", "url": "https://pdf24x.com" }
      },
      {
        "@type": "HowTo",
        "name": `How to use ${name}`,
        "description": description,
        "tool": { "@type": "HowToTool", "name": name },
        "step": [
          { "@type": "HowToStep", "position": 1, "name": "Open the tool", "text": `Go to ${url}` },
          { "@type": "HowToStep", "position": 2, "name": "Enter your data", "text": "Fill in the required fields or upload your file." },
          { "@type": "HowToStep", "position": 3, "name": "Get result", "text": "Your result is shown instantly — download or copy it." }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

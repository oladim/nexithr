import Image from "next/image";

/**
 * The official NexIT-Africa logo (N mark with arrow + wordmark), used
 * everywhere a logo appears so the brand is identical across the site.
 *   tone="light" → for white / light backgrounds (navy mark, blue wordmark)
 *   tone="dark"  → for dark backgrounds (white mark, blue wordmark)
 * The source artwork is 324×80; `height` sets the rendered size.
 */
export default function BrandLogo({ tone = "light", height = 34, priority = false, className = "" }) {
  const width = Math.round((324 / 80) * height);
  return (
    <Image
      src={tone === "dark" ? "/images/logo-dark.png" : "/images/logo.png"}
      alt="NexIT-Africa"
      width={width}
      height={height}
      priority={priority}
      className={`brand-logo ${className}`}
      style={{ width, height, objectFit: "contain" }}
    />
  );
}

#!/usr/bin/env node

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_ORIGIN = "https://altioria.ru";
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENT_REQUESTS = 8;

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const productsDirectory = path.join(
  repositoryRoot,
  "infra/minio/products/seed",
);
const catalogPath = path.join(
  repositoryRoot,
  "altioria-backend/prisma/data/catalog.json",
);

const categories = [
  {
    page: "tables.html",
    slug: "tables",
    nameRu: "Столы",
    nameEn: "Tables",
    sortOrder: 10,
  },
  {
    page: "lightning.html",
    slug: "lighting",
    nameRu: "Освещение",
    nameEn: "Lighting",
    sortOrder: 20,
  },
  {
    page: "seating.html",
    slug: "seating",
    nameRu: "Мягкая мебель",
    nameEn: "Seating",
    sortOrder: 30,
  },
  {
    page: "storages.html",
    slug: "storages",
    nameRu: "Системы хранения",
    nameEn: "Storages",
    sortOrder: 40,
  },
  {
    page: "consoles.html",
    slug: "consoles",
    nameRu: "Консоли",
    nameEn: "Consoles",
    sortOrder: 50,
  },
  {
    page: "mirrors.html",
    slug: "mirrors",
    nameRu: "Зеркала",
    nameEn: "Mirrors",
    sortOrder: 60,
  },
];

function createLimiter(limit) {
  let active = 0;
  const queue = [];

  const runNext = () => {
    if (active >= limit || queue.length === 0) {
      return;
    }

    active += 1;
    const job = queue.shift();

    void job().finally(() => {
      active -= 1;
      runNext();
    });
  };

  return (job) =>
    new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          resolve(await job());
        } catch (error) {
          reject(error);
        }
      });

      runNext();
    });
}

const limitRequest = createLimiter(MAX_CONCURRENT_REQUESTS);
const requestCache = new Map();
const warnedBrokenFiles = new Set();

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function download(url) {
  const cachedRequest = requestCache.get(url);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = limitRequest(async () => {
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch(url, {
          headers: {
            "user-agent":
              "Altioria catalog migration/1.0 (+https://altioria.ru)",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        return {
          bytes: Buffer.from(await response.arrayBuffer()),
          contentType:
            response.headers.get("content-type")?.split(";")[0] ??
            "application/octet-stream",
        };
      } catch (error) {
        lastError = error;

        if (attempt < MAX_ATTEMPTS) {
          await delay(attempt * 750);
        }
      }
    }

    throw new Error(
      `Unable to download ${url}: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`,
    );
  });

  requestCache.set(url, request);

  return request;
}

async function downloadText(url) {
  const result = await download(url);

  return result.bytes.toString("utf8");
}

function removeComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi,
    (entity, code) => {
      if (code.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      }

      if (code.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      }

      return namedEntities[code.toLowerCase()] ?? entity;
    },
  );
}

function htmlToText(value) {
  return decodeHtml(
    value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractElementText(html, tag, className) {
  const classPattern = escapeRegExp(className);
  const expression = new RegExp(
    `<${tag}\\b[^>]*class=["'][^"']*\\b${classPattern}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "i",
  );

  const match = html.match(expression);

  return match ? htmlToText(match[1]) : "";
}

function extractDescription(html) {
  const paragraphs = [];
  const expression =
    /<p\b[^>]*class=["'][^"']*\bproduct-description\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi;

  for (const match of html.matchAll(expression)) {
    const text = htmlToText(match[1]);

    if (text) {
      paragraphs.push(text);
    }
  }

  return paragraphs.join("\n\n");
}

function parseDimensionValue(value) {
  const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/);

  return match ? Math.round(Number(match[0])) : null;
}

function extractSpecifications(html) {
  const result = {
    heightMm: null,
    widthMm: null,
    depthMm: null,
    materials: null,
  };

  const expression =
    /<div\b[^>]*class=["'][^"']*\bdimension-item\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;

  for (const match of html.matchAll(expression)) {
    const item = match[1];
    const label = extractElementText(item, "span", "dimension-label")
      .toLowerCase()
      .trim();
    const value = extractElementText(item, "span", "dimension-value");

    if (!value) {
      continue;
    }

    if (/height|высота/.test(label)) {
      result.heightMm = parseDimensionValue(value);
    } else if (/width|ширина/.test(label)) {
      result.widthMm = parseDimensionValue(value);
    } else if (/depth|глубина/.test(label)) {
      result.depthMm = parseDimensionValue(value);
    } else if (/material|материал/.test(label)) {
      result.materials = value;
    }
  }

  return result;
}

function unique(values) {
  return [...new Set(values)];
}

function extractImageUrls(html, pageUrl) {
  const urls = [];
  const galleryMatch = html.match(
    /const\s+productImages\s*=\s*\{([\s\S]*?)\n\s*\};/i,
  );

  if (galleryMatch) {
    const expression =
      /["']([^"']+\.(?:avif|gif|jpe?g|png|webp)(?:\?[^"']*)?)["']/gi;

    for (const match of galleryMatch[1].matchAll(expression)) {
      urls.push(new URL(match[1], pageUrl).href);
    }
  }

  if (urls.length === 0) {
    const mainImageMatch = html.match(
      /<img\b[^>]*class=["'][^"']*\bproduct-main-image\b[^"']*["'][^>]*src=["']([^"']+)["']/i,
    );

    if (mainImageMatch) {
      urls.push(new URL(mainImageMatch[1], pageUrl).href);
    }
  }

  return unique(urls);
}

function extractFileUrls(html, pageUrl) {
  const urls = [];
  const expression =
    /<a\b[^>]*href=["']([^"']+\.(?:glb|gltf|pdf)(?:\?[^"']*)?)["']/gi;

  for (const match of html.matchAll(expression)) {
    urls.push(new URL(match[1], pageUrl).href);
  }

  return unique(urls);
}

function extractVariantPageUrls(html, pageUrl) {
  const optionHeading = html.search(/Choose\s+Option|Выберите\s+исполнение/i);

  if (optionHeading === -1) {
    return [];
  }

  const optionArea = html.slice(
    optionHeading,
    html.indexOf("<p", optionHeading) === -1
      ? undefined
      : html.indexOf("<p", optionHeading),
  );
  const urls = [];
  const expression = /<a\b[^>]*href=["']([^"']+\.html)["']/gi;

  for (const match of optionArea.matchAll(expression)) {
    const url = new URL(match[1], pageUrl);

    if (url.origin === SOURCE_ORIGIN && !url.pathname.endsWith("/form.html")) {
      urls.push(url.href);
    }
  }

  return unique(urls);
}

function extractListedProducts(html, categoryPageUrl) {
  const cleanedHtml = removeComments(html);
  const products = [];
  const expression =
    /<a\b[^>]*class=["'][^"']*\btable-card\b[^"']*["'][^>]*href=["']([^"']+\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of cleanedHtml.matchAll(expression)) {
    products.push({
      pageUrl: new URL(match[1], categoryPageUrl).href,
      cardName: extractElementText(match[2], "div", "category-name"),
    });
  }

  return products;
}

function slugFromPageUrl(pageUrl) {
  const pageName = decodeURIComponent(
    new URL(pageUrl).pathname.split("/").pop(),
  );

  return pageName
    .replace(/\.html$/i, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeAssetName(url, index) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const originalName = path.basename(pathname) || `asset-${index + 1}`;
  const extension = path.extname(originalName).toLowerCase();
  const stem =
    path
      .basename(originalName, path.extname(originalName))
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || `asset-${index + 1}`;

  return `${String(index + 1).padStart(2, "0")}-${stem}${extension}`;
}

function fileTypeFromUrl(url) {
  return new URL(url).pathname.toLowerCase().endsWith(".pdf")
    ? "PDF"
    : "MODEL_3D";
}

function defaultFileLabel(type) {
  return type === "PDF"
    ? { labelRu: "Чертежи", labelEn: "Drawings" }
    : { labelRu: "3D-модель", labelEn: "3D model" };
}

async function saveImages(imageUrls, relativeDirectory, productName) {
  return Promise.all(
    imageUrls.map(async (url, index) => {
      const filename = safeAssetName(url, index);
      const key = path.posix.join(
        "products/seed",
        relativeDirectory,
        "images",
        filename,
      );
      const destination = path.join(repositoryRoot, "infra/minio", key);
      const asset = await download(url);

      if (!asset.contentType.startsWith("image/")) {
        throw new Error(
          `Expected an image from ${url}, received ${asset.contentType}`,
        );
      }

      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, asset.bytes);

      return {
        imageKey: key,
        altRu: productName,
        altEn: productName,
        sortOrder: (index + 1) * 10,
        sourceUrl: url,
      };
    }),
  );
}

async function saveFiles(fileUrls, relativeDirectory) {
  const files = await Promise.all(
    fileUrls.map(async (url, index) => {
      const filename = safeAssetName(url, index);
      const key = path.posix.join(
        "products/seed",
        relativeDirectory,
        "files",
        filename,
      );
      const destination = path.join(repositoryRoot, "infra/minio", key);
      const type = fileTypeFromUrl(url);
      const labels = defaultFileLabel(type);
      let asset;

      try {
        asset = await download(url);
      } catch (error) {
        if (error instanceof Error && error.message.includes("HTTP 404")) {
          if (!warnedBrokenFiles.has(url)) {
            warnedBrokenFiles.add(url);
            console.warn(`Skipping broken file link: ${url}`);
          }

          return null;
        }

        throw error;
      }

      if (asset.contentType.startsWith("text/html")) {
        throw new Error(`Expected a file from ${url}, received HTML`);
      }

      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, asset.bytes);

      return {
        type,
        fileKey: key,
        originalName: decodeURIComponent(path.basename(new URL(url).pathname)),
        mimeType: asset.contentType,
        sizeBytes: asset.bytes.length,
        ...labels,
        sortOrder: (index + 1) * 10,
        sourceUrl: url,
      };
    }),
  );

  return files.filter((file) => file !== null);
}

function extractPrice(html) {
  const block = html.match(
    /<div\b[^>]*class=["'][^"']*\bproduct-price\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const text = block ? htmlToText(block[1]) : "";

  if (!text || /on\s+request|по\s+запросу/i.test(text)) {
    return {
      priceType: "ON_REQUEST",
      priceAmount: null,
      priceCurrency: null,
    };
  }

  const amountMatch = text.replace(/\s/g, "").match(/\d+(?:[.,]\d+)?/);

  if (!amountMatch) {
    return {
      priceType: "ON_REQUEST",
      priceAmount: null,
      priceCurrency: null,
    };
  }

  const currency = /€|EUR/i.test(text)
    ? "EUR"
    : /\$|USD/i.test(text)
      ? "USD"
      : "RUB";

  return {
    priceType: "FIXED",
    priceAmount: amountMatch[0].replace(",", "."),
    priceCurrency: currency,
  };
}

async function parseProductPage(pageUrl, categorySlug, sortOrder, directory) {
  const html = removeComments(await downloadText(pageUrl));
  const slug = slugFromPageUrl(pageUrl);
  const name = extractElementText(html, "h1", "product-name") || slug;
  const description = extractDescription(html);
  const specifications = extractSpecifications(html);
  const price = extractPrice(html);
  const images = await saveImages(
    extractImageUrls(html, pageUrl),
    directory,
    name,
  );
  const files = await saveFiles(extractFileUrls(html, pageUrl), directory);

  return {
    product: {
      categorySlug,
      slug,
      nameRu: name,
      nameEn: name,
      descriptionRu: description,
      descriptionEn: description,
      materialsRu: specifications.materials,
      materialsEn: specifications.materials,
      heightMm: specifications.heightMm,
      widthMm: specifications.widthMm,
      depthMm: specifications.depthMm,
      ...price,
      sortOrder,
      isPublished: images.length > 0,
      images,
      files,
      variants: [],
      sourceUrl: pageUrl,
    },
    variantPageUrls: extractVariantPageUrls(html, pageUrl),
  };
}

async function buildProduct(category, listedProduct, index) {
  const slug = slugFromPageUrl(listedProduct.pageUrl);
  const parsed = await parseProductPage(
    listedProduct.pageUrl,
    category.slug,
    (index + 1) * 10,
    slug,
  );

  parsed.product.variants = await Promise.all(
    parsed.variantPageUrls.map(async (variantPageUrl, variantIndex) => {
      const variantSlug = slugFromPageUrl(variantPageUrl);
      const variant = await parseProductPage(
        variantPageUrl,
        category.slug,
        (variantIndex + 1) * 10,
        path.posix.join(slug, "variants", variantSlug),
      );

      return {
        slug: variant.product.slug,
        nameRu: variant.product.nameRu,
        nameEn: variant.product.nameEn,
        descriptionRu: variant.product.descriptionRu || null,
        descriptionEn: variant.product.descriptionEn || null,
        materialsRu: variant.product.materialsRu,
        materialsEn: variant.product.materialsEn,
        heightMm: variant.product.heightMm,
        widthMm: variant.product.widthMm,
        depthMm: variant.product.depthMm,
        priceType: variant.product.priceType,
        priceAmount: variant.product.priceAmount,
        priceCurrency: variant.product.priceCurrency,
        sortOrder: (variantIndex + 1) * 10,
        isPublished: variant.product.images.length > 0,
        images: variant.product.images,
        files: variant.product.files,
        sourceUrl: variantPageUrl,
      };
    }),
  );

  console.log(
    `[${category.slug}] ${parsed.product.nameEn}: ` +
      `${parsed.product.images.length} images, ` +
      `${parsed.product.files.length} files, ` +
      `${parsed.product.variants.length} variants`,
  );

  return parsed.product;
}

async function main() {
  await mkdir(productsDirectory, { recursive: true });
  await mkdir(path.dirname(catalogPath), { recursive: true });

  const catalogCategories = await Promise.all(
    categories.map(async (category) => {
      const categoryPageUrl = new URL(category.page, SOURCE_ORIGIN).href;
      const categoryHtml = await downloadText(categoryPageUrl);
      const listedProducts = extractListedProducts(
        categoryHtml,
        categoryPageUrl,
      );

      if (listedProducts.length === 0) {
        throw new Error(`No products found on ${categoryPageUrl}`);
      }

      const products = await Promise.all(
        listedProducts.map((product, index) =>
          buildProduct(category, product, index),
        ),
      );

      return {
        slug: category.slug,
        nameRu: category.nameRu,
        nameEn: category.nameEn,
        sortOrder: category.sortOrder,
        products,
      };
    }),
  );

  const catalog = {
    source: `${SOURCE_ORIGIN}/products.html`,
    categories: catalogCategories,
  };

  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  const productCount = catalogCategories.reduce(
    (count, category) => count + category.products.length,
    0,
  );
  const variantCount = catalogCategories.reduce(
    (count, category) =>
      count +
      category.products.reduce(
        (categoryCount, product) => categoryCount + product.variants.length,
        0,
      ),
    0,
  );

  const manifestStats = await stat(catalogPath);

  console.log(
    `Catalog saved: ${productCount} products, ${variantCount} variants, ` +
      `${manifestStats.size} byte manifest`,
  );
  console.log(`Media directory: ${productsDirectory}`);
  console.log(`Manifest: ${catalogPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

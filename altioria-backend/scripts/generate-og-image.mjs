import {
  mkdir,
} from 'node:fs/promises';

import path from 'node:path';

import sharp from 'sharp';

const frontendImagesDirectory =
  path.resolve(
    process.cwd(),
    '../altioria-frontend/public/images',
  );

const backgroundPath = path.join(
  frontendImagesDirectory,
  'home-background.webp',
);

const logoPath = path.join(
  frontendImagesDirectory,
  'altioria-logo.svg',
);

const outputDirectory = path.join(
  frontendImagesDirectory,
  'og',
);

const outputPath = path.join(
  outputDirectory,
  'altioria.jpg',
);

await mkdir(
  outputDirectory,
  {
    recursive: true,
  },
);

const preparedLogo = await sharp(
  logoPath,
)
  .resize({
    width: 420,
    withoutEnlargement: true,
  })
  .png()
  .toBuffer();

await sharp(backgroundPath)
  .resize(1200, 630, {
    fit: 'cover',
    position: 'centre',
  })
  .modulate({
    brightness: 0.45,
    saturation: 0.8,
  })
  .composite([
    {
      input: preparedLogo,
      gravity: 'centre',
    },
  ])
  .jpeg({
    quality: 90,
    mozjpeg: true,
  })
  .toFile(outputPath);

console.log(
  `OG image created: ${outputPath}`,
);
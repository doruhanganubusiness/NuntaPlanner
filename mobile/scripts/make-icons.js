/* Generează iconițele aplicației din images/icon-app.jpg folosind sharp
   (instalat în proiectul web). Rulează: node scripts/make-icons.js */
const path = require("path");
const sharp = require(path.join(
  __dirname,
  "..",
  "..",
  "node_modules",
  "sharp",
));

const SRC = path.join(__dirname, "..", "..", "images", "icon-app.jpg");
const OUT = path.join(__dirname, "..", "assets", "images");
const white = { r: 255, g: 255, b: 255, alpha: 1 };
const clear = { r: 255, g: 255, b: 255, alpha: 0 };

async function main() {
  // Icon principal 1024x1024, logo încadrat pe fundal alb.
  await sharp(SRC)
    .resize(1024, 1024, { fit: "contain", background: white })
    .png()
    .toFile(path.join(OUT, "icon.png"));

  // Foreground pentru adaptive icon (Android): logo mai mic, centrat, cu
  // padding (safe zone), fundal transparent — fundalul alb vine din backgroundColor.
  await sharp(SRC)
    .resize(600, 600, { fit: "contain", background: clear })
    .extend({ top: 212, bottom: 212, left: 212, right: 212, background: clear })
    .png()
    .toFile(path.join(OUT, "android-icon-foreground.png"));

  // Splash: logo încadrat, transparent (Expo îl scalează după imageWidth).
  await sharp(SRC)
    .resize(1024, 1024, { fit: "contain", background: clear })
    .png()
    .toFile(path.join(OUT, "splash-icon.png"));

  // Favicon web.
  await sharp(SRC)
    .resize(48, 48, { fit: "contain", background: white })
    .png()
    .toFile(path.join(OUT, "favicon.png"));

  console.log("icons generated OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

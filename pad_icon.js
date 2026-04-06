const sharp = require('sharp');
const fs = require('fs');

async function padIcon() {
  const originalPath = "C:\\Users\\Girish K A\\.gemini\\antigravity\\brain\\2b0964da-d6d3-4c65-bec4-e51e6a0579fd\\media__1775023412863.jpg";
  const iconDest = "C:\\Users\\Girish K A\\OneDrive\\Desktop\\my projects\\interstellar-zodiac\\assets\\images\\icon.png";
  const fgDest = "C:\\Users\\Girish K A\\OneDrive\\Desktop\\my projects\\interstellar-zodiac\\assets\\images\\android-icon-foreground.png";
  const splashDest = "C:\\Users\\Girish K A\\OneDrive\\Desktop\\my projects\\interstellar-zodiac\\assets\\images\\splash-icon.png";

  try {
    const targetSize = 1024;
    const innerSize = Math.floor(targetSize * 0.62); 
    const padding = Math.floor((targetSize - innerSize) / 2);

    await sharp(originalPath)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: targetSize - innerSize - padding,
        left: padding,
        right: targetSize - innerSize - padding,
        background: { r: 10, g: 10, b: 10, alpha: 1 } // slightly off-black to match the image's dark theme
      })
      .toFile(iconDest);

    fs.copyFileSync(iconDest, fgDest);
    fs.copyFileSync(originalPath, splashDest);

    console.log("Successfully padded icon to safe zone!");
  } catch (err) {
    console.error("Error padding icon:", err);
  }
}
padIcon();

const Jimp = require("jimp");
const fs = require('fs');

async function processImage() {
  const imagePath = "C:\\Users\\Girish K A\\.gemini\\antigravity\\brain\\2b0964da-d6d3-4c65-bec4-e51e6a0579fd\\media__1774946374634.png";
  const iconDest = "C:\\Users\\Girish K A\\OneDrive\\Desktop\\my projects\\interstellar-zodiac\\assets\\images\\icon.png";
  const splashDest = "C:\\Users\\Girish K A\\OneDrive\\Desktop\\my projects\\interstellar-zodiac\\assets\\images\\splash-icon.png";
  
  try {
    const rawData = fs.readFileSync(imagePath);
    let img;
    try {
      img = await Jimp.read(rawData);
    } catch(e) {
      if (Jimp.Jimp) { // v1.x support
        img = await Jimp.Jimp.read(rawData);
      } else {
        throw e;
      }
    }
    
    // The image width is W, height is H. We split it in half.
    const width = img.bitmap.width;
    const height = img.bitmap.height;
    const halfWidth = Math.floor(width / 2);
    
    // Left side for icon
    const icon = img.clone().crop(0, 0, halfWidth, height);
    
    // An icon must be square. Let's make it a square by padding with black.
    // If height > halfWidth, we pad width
    const size = Math.max(halfWidth, height);
    
    if (icon.contain) {
      icon.contain(size, size); 
    } else {
      // Manual padding if contain is missing
      const canvas = await Jimp.create ? await Jimp.create(size, size, 0x000000FF) : new Jimp(size, size, 0x000000FF);
      canvas.blit(icon, Math.floor((size - halfWidth) / 2), Math.floor((size - height) / 2));
      await canvas.writeAsync(iconDest);
    }
    
    if (icon.writeAsync) {
        await icon.writeAsync(iconDest);
    } else {
        icon.write(iconDest);
    }
    
    // Right side for Splash
    const splash = img.clone().crop(halfWidth, 0, halfWidth, height);
    if (splash.writeAsync) {
        await splash.writeAsync(splashDest);
    } else {
        splash.write(splashDest);
    }
    
    console.log("Image successfully cropped and saved!");
  } catch (err) {
    console.error("Jimp error:", err);
  }
}

processImage();

Add-Type -AssemblyName System.Drawing
$imagePath = "C:\Users\Girish K A\.gemini\antigravity\brain\2b0964da-d6d3-4c65-bec4-e51e6a0579fd\media__1774946374634.png"
$img = [System.Drawing.Image]::FromFile($imagePath)
$halfWidth = [math]::Floor($img.Width / 2)
$height = $img.Height

$bmpIcon = New-Object System.Drawing.Bitmap $halfWidth, $height
$gIcon = [System.Drawing.Graphics]::FromImage($bmpIcon)
$rectDest = New-Object System.Drawing.Rectangle 0, 0, $halfWidth, $height
$rectSrc1 = New-Object System.Drawing.Rectangle 0, 0, $halfWidth, $height
$gIcon.DrawImage($img, $rectDest, $rectSrc1, [System.Drawing.GraphicsUnit]::Pixel)
$bmpIcon.Save("C:\Users\Girish K A\OneDrive\Desktop\my projects\interstellar-zodiac\assets\images\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gIcon.Dispose()
$bmpIcon.Dispose()

$bmpSplash = New-Object System.Drawing.Bitmap $halfWidth, $height
$gSplash = [System.Drawing.Graphics]::FromImage($bmpSplash)
$rectSrc2 = New-Object System.Drawing.Rectangle $halfWidth, 0, $halfWidth, $height
$gSplash.DrawImage($img, $rectDest, $rectSrc2, [System.Drawing.GraphicsUnit]::Pixel)
$bmpSplash.Save("C:\Users\Girish K A\OneDrive\Desktop\my projects\interstellar-zodiac\assets\images\splash-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gSplash.Dispose()
$bmpSplash.Dispose()
$img.Dispose()

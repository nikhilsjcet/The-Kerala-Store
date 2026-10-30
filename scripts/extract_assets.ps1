Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Admin\.gemini\antigravity\brain\83c0be2b-2f03-46a2-9d5b-08f41e3f4506\.user_uploaded'
$outDir = 'c:\Users\Admin\.gemini\antigravity\scratch\thekeralastore\public\mockup'

# 1. From media_1793379786500_f3dd173a.png (Track Orders Screen: 709 x 1024)
$img3 = [System.Drawing.Bitmap]::FromFile("$sourcePath\media_1793379786500_f3dd173a.png")

# Whole hero banner: x=22, y=178, w=665, h=275
$rectBanner = New-Object System.Drawing.Rectangle(22, 178, 665, 275)
$cropBanner = $img3.Clone($rectBanner, $img3.PixelFormat)
$cropBanner.Save("$outDir\orders-hero-banner.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropBanner.Dispose()

# Parcel box on right of banner: x=365, y=178, w=322, h=275
$rectBox = New-Object System.Drawing.Rectangle(365, 178, 322, 275)
$cropBox = $img3.Clone($rectBox, $img3.PixelFormat)
$cropBox.Save("$outDir\orders-parcel-box.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropBox.Dispose()
$img3.Dispose()

# 2. From media_1793379786486_40a356ce.png (Order Details Confirmed Screen: 561 x 1024)
$img1 = [System.Drawing.Bitmap]::FromFile("$sourcePath\media_1793379786486_40a356ce.png")
# Dark green hero card: x=36, y=136, w=489, h=376
$rectHero1 = New-Object System.Drawing.Rectangle(36, 136, 489, 376)
$cropHero1 = $img1.Clone($rectHero1, $img1.PixelFormat)
$cropHero1.Save("$outDir\order-confirmed-hero-card.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropHero1.Dispose()

# Dark green hero box portion with leaves: x=310, y=136, w=215, h=260
$rectGreenBox = New-Object System.Drawing.Rectangle(310, 136, 215, 260)
$cropGreenBox = $img1.Clone($rectGreenBox, $img1.PixelFormat)
$cropGreenBox.Save("$outDir\order-confirmed-box.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropGreenBox.Dispose()
$img1.Dispose()

# 3. From media_1793379786490_0f5be755.png (Live Tracking Screen: 567 x 1024)
$img2 = [System.Drawing.Bitmap]::FromFile("$sourcePath\media_1793379786490_0f5be755.png")

# Route map illustration in Shipping Destination: x=305, y=628, w=220, h=160
$rectMap = New-Object System.Drawing.Rectangle(305, 628, 220, 160)
$cropMap = $img2.Clone($rectMap, $img2.PixelFormat)
$cropMap.Save("$outDir\tracking-map-route.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropMap.Dispose()

# Packaging dispatch leaves graphic on right of status card: x=420, y=380, w=115, h=155
$rectStatusBox = New-Object System.Drawing.Rectangle(420, 380, 115, 155)
$cropStatusBox = $img2.Clone($rectStatusBox, $img2.PixelFormat)
$cropStatusBox.Save("$outDir\tracking-status-dispatch.png", [System.Drawing.Imaging.ImageFormat]::Png)
$cropStatusBox.Dispose()

$img2.Dispose()

Write-Output "Assets extracted successfully!"


# fix-video-urls.ps1 - Fill empty video URLs and subtitles via yt-dlp
param()

$REPO_DIR = "C:\Users\Administrator\.openclaw\workspace\musk-tweets"
$TWEETS_JSON = "$REPO_DIR\tweets.json"

Write-Host "Fixing video URLs..." -ForegroundColor Cyan

$data = Get-Content $TWEETS_JSON -Raw -Encoding UTF8 | ConvertFrom-Json
$tweets = if ($data -is [array]) { $data } else { $data.tweets }

$fixed = 0
$failed = 0

foreach ($t in $tweets) {
    if (-not $t.media) { continue }
    foreach ($m in $t.media) {
        if ($m.type -ne 'video') { continue }
        if ($m.url -and $m.url.Length -gt 0) { continue }
        if (-not $t.link) { continue }

        Write-Host "  Video tweet: $($t.link)" -ForegroundColor Gray

        # Get video URL
        try {
            $videoUrl = (python -m yt_dlp --no-download --get-url --format "best[ext=mp4]/best" --no-playlist $t.link 2>$null) | Select-Object -First 1
            if ($videoUrl -and $videoUrl.StartsWith("http")) {
                $m.url = $videoUrl
                Write-Host "  OK url: $($videoUrl.Substring(0,[Math]::Min(80,$videoUrl.Length)))" -ForegroundColor Green
                $fixed++
            } else {
                Write-Host "  SKIP: no url returned" -ForegroundColor Yellow
                $failed++
                continue
            }
        } catch {
            Write-Host "  FAIL yt-dlp: $_" -ForegroundColor Red
            $failed++
            continue
        }

        # Get subtitles
        try {
            $infoJson = (python -m yt_dlp --no-download --dump-json --no-playlist $t.link 2>$null) | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($infoJson) {
                $subUrl = $null
                if ($infoJson.automatic_captions -and $infoJson.automatic_captions.en) {
                    $subUrl = $infoJson.automatic_captions.en[0].url
                }
                if (-not $subUrl -and $infoJson.subtitles -and $infoJson.subtitles.en) {
                    $subUrl = $infoJson.subtitles.en[0].url
                }

                if ($subUrl) {
                    $subContent = Invoke-RestMethod -Uri $subUrl -TimeoutSec 10 -ErrorAction SilentlyContinue
                    if ($subContent) {
                        $lines = ($subContent -split "`n") | ForEach-Object { $_.Trim() }
                        $textLines = $lines | Where-Object {
                            $_ -ne '' -and
                            $_ -notmatch '^WEBVTT' -and
                            $_ -notmatch '^NOTE' -and
                            $_ -notmatch '^\d{2}:\d{2}' -and
                            $_ -notmatch '-->'
                        }
                        $seen = [System.Collections.Generic.HashSet[string]]::new()
                        $uniqueLines = $textLines | Where-Object { $seen.Add($_) }
                        $subtitleEn = $uniqueLines -join ' '

                        if ($subtitleEn.Length -gt 10) {
                            $m | Add-Member -NotePropertyName 'subtitle_en' -NotePropertyValue $subtitleEn -Force
                            $encoded = [System.Uri]::EscapeDataString($subtitleEn.Substring(0, [Math]::Min(500, $subtitleEn.Length)))
                            $transUrl = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=$encoded"
                            $resp = Invoke-RestMethod -Uri $transUrl -TimeoutSec 5 -ErrorAction SilentlyContinue
                            $subtitleCn = ($resp[0] | ForEach-Object { $_[0] }) -join ""
                            $m | Add-Member -NotePropertyName 'subtitle_cn' -NotePropertyValue $subtitleCn -Force
                            Write-Host "  OK subtitle: $($subtitleEn.Substring(0,[Math]::Min(60,$subtitleEn.Length)))" -ForegroundColor Green
                        }
                    }
                } else {
                    Write-Host "  No subtitles available" -ForegroundColor Gray
                }
            }
        } catch {
            Write-Host "  Subtitle fetch failed (non-fatal): $_" -ForegroundColor Yellow
        }

        Start-Sleep -Milliseconds 500
    }
}

Write-Host "Result: fixed=$fixed failed=$failed" -ForegroundColor Cyan

$tweets | ConvertTo-Json -Depth 10 | Set-Content $TWEETS_JSON -Encoding UTF8
Write-Host "Saved to $TWEETS_JSON"

Push-Location $REPO_DIR
git add tweets.json
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "fix: fill video URLs and subtitles ($fixed fixed)"
    git push origin main
    Write-Host "Pushed! https://xh-20-22.github.io/musk-tweets/" -ForegroundColor Green
} else {
    Write-Host "No changes to push" -ForegroundColor Yellow
}
Pop-Location

Write-Host "Done at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

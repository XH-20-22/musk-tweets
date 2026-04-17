# setup-scheduler.ps1
# 设置 Windows 计划任务，每天自动抓取并推送推文

$TaskName = "MuskTweetAutoUpdate"
$ScriptPath = "C:\Users\Administrator\.openclaw\workspace\musk-tweets\fetch-and-push.ps1"
$LogPath = "C:\Users\Administrator\.openclaw\workspace\musk-tweets\auto-update.log"

# 删除已有同名任务
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "已删除旧任务"
}

# 创建触发器：每天 09:00 和 21:00 各执行一次
$trigger1 = New-ScheduledTaskTrigger -Daily -At "09:00"
$trigger2 = New-ScheduledTaskTrigger -Daily -At "21:00"

# 执行动作
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -NonInteractive -File `"$ScriptPath`" >> `"$LogPath`" 2>&1"

# 任务设置（以当前用户运行，无论是否登录）
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 10) `
    -StartWhenAvailable

# 注册任务
Register-ScheduledTask `
    -TaskName $TaskName `
    -Trigger $trigger1, $trigger2 `
    -Action $action `
    -Settings $settings `
    -RunLevel Highest `
    -Force

Write-Host "✅ 定时任务创建成功！" -ForegroundColor Green
Write-Host "📅 执行时间：每天 09:00 和 21:00" -ForegroundColor Cyan
Write-Host "📋 任务名称：$TaskName" -ForegroundColor Cyan
Write-Host "📝 日志文件：$LogPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "管理命令："
Write-Host "  查看任务：Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "  立即运行：Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "  删除任务：Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"

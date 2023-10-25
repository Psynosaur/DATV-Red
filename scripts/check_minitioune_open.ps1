$output = Get-Process | Where {$_.ProcessName -Like "MiniTioune*"}
if ($output) { $output.Id } else { 0 }
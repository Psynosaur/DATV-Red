[XML]$xmlfile = Get-Content .\task_scheduler_template.xml
$xmlfile.Task.Actions.Exec.Command = "$env:USERPROFILE\AppData\Roaming\npm\node-red.cmd"
$xmlfile.Task.Actions.Exec.WorkingDirectory = "$pwd/.."
$xmlfile.save("$pwd\start_up_node_red.xml")

Register-ScheduledTask -Xml (get-content 'start_up_node_red.xml' | out-string) -TaskName "start_node_red"
Start-ScheduledTask -TaskName "start_node_red"
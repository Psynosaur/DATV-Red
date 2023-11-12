$json = Get-Content -Path pluto.json -Raw | ConvertFrom-Json 
$callsign = $json.payload

$jsonDevice = Get-Content -Path device.json -Raw | ConvertFrom-Json 
$jsonDevice.callsign = $callsign

$saveBlob = $jsonDevice | ConvertTo-Json -Depth 9
$saveBlob | Set-Content -Path device.json
Try { 
    [Void][Window]
} Catch {
    Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class Window {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool MoveWindow(IntPtr handle, int x, int y, int width, int height, bool redraw);
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool ShowWindow(IntPtr handle, int state);
    }
    public struct RECT {
        public int Left;   // x position of upper-left corner
        public int Top;    // y position of upper-left corner
        public int Right;  // x position of lower-right corner
        public int Bottom; // y position of lower-right corner
    }
"@
}
$output = Get-Process | Where {$_.ProcessName -Like "ffplay*"}
if ($output) { 
    $XP  = $output
    $WH  = (Get-Process -Id $XP.Id).MainWindowHandle   
    $R   = New-Object RECT  # Define A Rectangle Object                                        
    [Void][Window]::GetWindowRect($WH,[ref]$R)   
    $object = [pscustomobject]@{
        Top = $R.Top
        Left = $R.Left
        }
    $object | Format-List -Property Top, Left | Write-Output
} else { 0 }


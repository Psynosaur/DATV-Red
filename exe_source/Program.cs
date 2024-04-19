namespace DATV_RED
{
    internal class Program
    {
        public static void Main(string[] args)
        {
            string strCmdText;
            strCmdText= @"/C start ""DATV-RED"" .\npm\node-red.cmd --userDir .\.node-red\";
            System.Diagnostics.Process.Start("CMD.exe",strCmdText);
        }
    }
}
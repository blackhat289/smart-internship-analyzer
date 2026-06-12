$npmCmd = Get-Command npm.cmd -ErrorAction Stop
& $npmCmd.Source $args
exit $LASTEXITCODE

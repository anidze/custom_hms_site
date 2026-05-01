USE [HMS]
GO

-- Drop old constraint and re-create with 3 statuses only (run once)
IF EXISTS (
  SELECT 1 FROM sys.check_constraints
  WHERE name = 'CHK_housekeeping_status'
)
  ALTER TABLE [dbo].[housekeeping] DROP CONSTRAINT [CHK_housekeeping_status]
GO

ALTER TABLE [dbo].[housekeeping]
  ADD CONSTRAINT [CHK_housekeeping_status]
  CHECK ([status] IN (N'DIRTY', N'CLEAN', N'OUT OF SERVICE'))
GO

-- Drop priority column if it was already added
IF COL_LENGTH('dbo.housekeeping', 'priority') IS NOT NULL
BEGIN
  IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CHK_housekeeping_priority'
  )
    ALTER TABLE [dbo].[housekeeping] DROP CONSTRAINT [CHK_housekeeping_priority]

  ALTER TABLE [dbo].[housekeeping] DROP CONSTRAINT [DF_housekeeping_priority]
  ALTER TABLE [dbo].[housekeeping] DROP COLUMN [priority]
END
GO

-- Update any stale CLEANING / INSPECTED values to CLEAN
UPDATE [dbo].[housekeeping]
SET [status] = N'CLEAN'
WHERE [status] IN (N'CLEANING', N'INSPECTED')
GO

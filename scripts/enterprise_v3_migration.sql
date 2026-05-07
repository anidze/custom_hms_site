USE [HMS]
GO

-- ─────────────────────────────────────────────────────────────────────────────
-- Enterprise PMS v3 Migration
-- Run this ONCE before deploying the updated application code.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Actual check-in / check-out timestamps ─────────────────────────────────
IF COL_LENGTH('dbo.bookings', 'actual_check_in') IS NULL
  ALTER TABLE dbo.bookings ADD actual_check_in DATETIME NULL;
GO
IF COL_LENGTH('dbo.bookings', 'actual_check_out') IS NULL
  ALTER TABLE dbo.bookings ADD actual_check_out DATETIME NULL;
GO

-- ── 2. Deposit fields ─────────────────────────────────────────────────────────
IF COL_LENGTH('dbo.bookings', 'deposit_amount') IS NULL
  ALTER TABLE dbo.bookings ADD deposit_amount DECIMAL(10,2) NULL;
GO
IF COL_LENGTH('dbo.bookings', 'deposit_method') IS NULL
  ALTER TABLE dbo.bookings ADD deposit_method NVARCHAR(50) NULL;
GO

-- ── 3. Additional service flags ───────────────────────────────────────────────
IF COL_LENGTH('dbo.bookings', 'include_breakfast') IS NULL
  ALTER TABLE dbo.bookings ADD include_breakfast BIT NOT NULL DEFAULT 0;
GO
IF COL_LENGTH('dbo.bookings', 'extra_bed') IS NULL
  ALTER TABLE dbo.bookings ADD extra_bed BIT NOT NULL DEFAULT 0;
GO
IF COL_LENGTH('dbo.bookings', 'is_vip') IS NULL
  ALTER TABLE dbo.bookings ADD is_vip BIT NOT NULL DEFAULT 0;
GO
IF COL_LENGTH('dbo.bookings', 'late_checkout') IS NULL
  ALTER TABLE dbo.bookings ADD late_checkout BIT NOT NULL DEFAULT 0;
GO

-- ── 4. Room status column ─────────────────────────────────────────────────────
IF COL_LENGTH('dbo.rooms', 'room_status') IS NULL
  ALTER TABLE dbo.rooms ADD room_status NVARCHAR(30) NOT NULL DEFAULT N'Vacant Clean';
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_rooms_room_status')
  ALTER TABLE dbo.rooms
    ADD CONSTRAINT CHK_rooms_room_status
    CHECK (room_status IN (
      N'Vacant Clean', N'Vacant Dirty', N'Occupied',
      N'Reserved', N'Out Of Order', N'Inspected'
    ));
GO

-- ── 5. Extended housekeeping statuses ─────────────────────────────────────────
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_housekeeping_status')
  ALTER TABLE dbo.housekeeping DROP CONSTRAINT CHK_housekeeping_status;
GO
ALTER TABLE dbo.housekeeping
  ADD CONSTRAINT CHK_housekeeping_status
  CHECK (status IN (N'DIRTY', N'CLEAN', N'CLEANING', N'INSPECTED', N'OUT OF SERVICE'));
GO
-- Sanitise any stale values before constraint is active
UPDATE dbo.housekeeping
SET status = N'CLEAN'
WHERE status NOT IN (N'DIRTY', N'CLEAN', N'CLEANING', N'INSPECTED', N'OUT OF SERVICE');
GO

-- ── 6. Audit logs ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'audit_logs')
  CREATE TABLE dbo.audit_logs (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    hotel_id      INT           NOT NULL,
    booking_id    INT           NULL,
    room_id       INT           NULL,
    action        NVARCHAR(100) NOT NULL,   -- CHECK_IN, CHECK_OUT, NO_SHOW, CANCEL …
    performed_by  INT           NULL,
    details       NVARCHAR(MAX) NULL,
    created_at    DATETIME      NOT NULL DEFAULT GETDATE()
  );
GO

-- ── 7. Folio lines ────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'folio_lines')
  CREATE TABLE dbo.folio_lines (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    hotel_id      INT            NOT NULL,
    booking_id    INT            NOT NULL,
    line_type     NVARCHAR(50)   NOT NULL DEFAULT N'Room Charge',
      -- Room Charge | Breakfast | Extra Bed | Tax | Discount | Deposit | Payment | Other
    description   NVARCHAR(200)  NULL,
    quantity      DECIMAL(10,2)  NOT NULL DEFAULT 1,
    unit_price    DECIMAL(10,2)  NOT NULL DEFAULT 0,
    total_amount  DECIMAL(10,2)  NOT NULL DEFAULT 0,
    is_credit     BIT            NOT NULL DEFAULT 0,   -- 1 = credit (deposit/payment)
    created_by    INT            NULL,
    created_at    DATETIME       NOT NULL DEFAULT GETDATE()
  );
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_folio_lines_booking' AND object_id = OBJECT_ID('dbo.folio_lines'))
  CREATE INDEX IX_folio_lines_booking ON dbo.folio_lines (booking_id);
GO

-- ── 8. Payments table — add extended columns if missing ──────────────────────
IF COL_LENGTH('dbo.payments', 'payment_method') IS NULL
  ALTER TABLE dbo.payments ADD payment_method NVARCHAR(50) NULL;
GO
IF COL_LENGTH('dbo.payments', 'paid_at') IS NULL
  ALTER TABLE dbo.payments ADD paid_at DATETIME NULL DEFAULT GETDATE();
GO
IF COL_LENGTH('dbo.payments', 'notes') IS NULL
  ALTER TABLE dbo.payments ADD notes NVARCHAR(500) NULL;
GO

-- ── 9. Ensure Cancelled and No Show booking statuses exist ────────────────────
IF NOT EXISTS (SELECT 1 FROM booking_status WHERE LOWER(name_eng) LIKE '%cancel%')
  INSERT INTO booking_status (name_eng, color_hex, is_active, sort_order)
  VALUES (N'Cancelled', N'#EF4444', 1, 90);
GO
IF NOT EXISTS (
  SELECT 1 FROM booking_status
  WHERE LOWER(name_eng) LIKE '%no%show%' OR LOWER(name_eng) = 'noshow'
)
  INSERT INTO booking_status (name_eng, color_hex, is_active, sort_order)
  VALUES (N'No Show', N'#F97316', 1, 95);
GO

-- ── 10. Back-fill room_status for currently occupied rooms ────────────────────
UPDATE r
SET r.room_status = N'Occupied'
FROM dbo.rooms r
WHERE r.id IN (
  SELECT DISTINCT b.room_id
  FROM dbo.bookings b
  JOIN dbo.booking_status bs ON bs.id = b.status_id
  WHERE b.room_id IS NOT NULL
    AND (LOWER(bs.name_eng) LIKE '%check%in%'
      OR LOWER(bs.name_eng) = 'in-house'
      OR LOWER(bs.name_eng) = 'in house')
);
GO
UPDATE r
SET r.room_status = N'Vacant Dirty'
FROM dbo.rooms r
JOIN dbo.housekeeping hk ON hk.room_id = r.id
WHERE hk.status = N'DIRTY'
  AND r.room_status != N'Occupied';
GO

PRINT 'Enterprise PMS v3 migration complete.';
GO

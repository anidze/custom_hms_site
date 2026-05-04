-- ═════════════════════════════════════════════════════════════════════════════
--  Bulk Bookings Seed  |  Hotels 1, 2, 3  |  270 additional bookings
--  30 × April (CheckedOut)  +  30 × May (mixed)  +  30 × June (Pending)
-- ═════════════════════════════════════════════════════════════════════════════

DECLARE @sPending    INT = (SELECT TOP 1 id FROM booking_status WHERE is_active = 1 ORDER BY sort_order ASC);
DECLARE @sCheckedIn  INT = (SELECT TOP 1 id FROM booking_status WHERE LOWER(name_eng) LIKE '%check%' AND LOWER(name_eng) LIKE '%in%' AND LOWER(name_eng) NOT LIKE '%out%');
DECLARE @sCheckedOut INT = (SELECT TOP 1 id FROM booking_status WHERE LOWER(name_eng) LIKE '%check%' AND LOWER(name_eng) LIKE '%out%');
DECLARE @rtSingle  INT = (SELECT id FROM room_type WHERE name_eng = 'Single Room');
DECLARE @rtDouble  INT = (SELECT id FROM room_type WHERE name_eng = 'Double Room');
DECLARE @rtTwin    INT = (SELECT id FROM room_type WHERE name_eng = 'Twin Room');
DECLARE @rtTriple  INT = (SELECT id FROM room_type WHERE name_eng = 'Triple Room');
DECLARE @rtFamily  INT = (SELECT id FROM room_type WHERE name_eng = 'Family Room');
DECLARE @rtSuite   INT = (SELECT id FROM room_type WHERE name_eng = 'Suite');
DECLARE @rtDeluxe  INT = (SELECT id FROM room_type WHERE name_eng = 'Deluxe Room');
DECLARE @rtPH      INT = (SELECT id FROM room_type WHERE name_eng = 'Penthouse');
DECLARE @gId INT;
DECLARE @h1user INT, @h2user INT, @h3user INT;
SET @h1user = COALESCE((SELECT TOP 1 id FROM users WHERE hotel_id = 1),(SELECT TOP 1 id FROM users));
SET @h2user = COALESCE((SELECT TOP 1 id FROM users WHERE hotel_id = 2),(SELECT TOP 1 id FROM users));
SET @h3user = COALESCE((SELECT TOP 1 id FROM users WHERE hotel_id = 3),(SELECT TOP 1 id FROM users));

-- ════════════════════════════════════════════════════════════════════════
-- HOTEL 1
-- ════════════════════════════════════════════════════════════════════════

-- ── APRIL 2026 — Checked-Out (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Giorgi Beridze','Giorgi','Beridze','Male',22,'+99577002001','bulk2001@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-01','2026-04-03',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nino Wilson','Nino','Wilson','Female',23,'+99577002002','bulk2002@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-02','2026-04-05',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Luka Nakashidze','Luka','Nakashidze','Male',24,'+99577002003','bulk2003@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-03','2026-04-07',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Mariam Martin','Mariam','Martin','Female',25,'+99577002004','bulk2004@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-04','2026-04-06',1,0,1,300.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'David Javakhishvili','David','Javakhishvili','Male',26,'+99577002005','bulk2005@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-05','2026-04-08',2,0,1,600.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ana Brown','Ana','Brown','Female',27,'+99577002006','bulk2006@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-06','2026-04-10',3,0,1,1000.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tornike Gurgenidze','Tornike','Gurgenidze','Male',28,'+99577002007','bulk2007@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-07','2026-04-09',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tamar Chen','Tamar','Chen','Female',29,'+99577002008','bulk2008@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-08','2026-04-11',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Sandro Shalikiani','Sandro','Shalikiani','Male',30,'+99577002009','bulk2009@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-09','2026-04-13',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Elene Johnson','Elene','Johnson','Female',31,'+99577002010','bulk2010@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-10','2026-04-12',1,0,1,300.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nikoloz Khachidze','Nikoloz','Khachidze','Male',32,'+99577002011','bulk2011@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-11','2026-04-14',2,0,1,600.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Salome Schmidt','Salome','Schmidt','Female',33,'+99577002012','bulk2012@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-12','2026-04-16',3,0,1,1000.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Irakli Lomidze','Irakli','Lomidze','Male',34,'+99577002013','bulk2013@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-13','2026-04-15',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ketevan Wagner','Ketevan','Wagner','Female',35,'+99577002014','bulk2014@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-14','2026-04-17',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Levan Tvaltvadze','Levan','Tvaltvadze','Male',36,'+99577002015','bulk2015@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-15','2026-04-19',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Natia Alves','Natia','Alves','Female',37,'+99577002016','bulk2016@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-16','2026-04-18',1,0,1,300.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Zaza Mikhelidze','Zaza','Mikhelidze','Male',38,'+99577002017','bulk2017@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-17','2026-04-20',2,0,1,600.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Maka Hassan','Maka','Hassan','Female',39,'+99577002018','bulk2018@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-18','2026-04-22',3,0,1,1000.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Beka Basilashvili','Beka','Basilashvili','Male',40,'+99577002019','bulk2019@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-19','2026-04-21',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ia Taylor','Ia','Taylor','Female',41,'+99577002020','bulk2020@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-20','2026-04-23',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Vakhtang Gvakharia','Vakhtang','Gvakharia','Male',42,'+99577002021','bulk2021@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-21','2026-04-25',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nana Anderson','Nana','Anderson','Female',43,'+99577002022','bulk2022@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-22','2026-04-24',1,0,1,300.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Shota Subeliani','Shota','Subeliani','Male',44,'+99577002023','bulk2023@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-23','2026-04-26',2,0,1,600.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Lali Thompson','Lali','Thompson','Female',45,'+99577002024','bulk2024@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-24','2026-04-28',3,0,1,1000.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Gia Kapanadze','Gia','Kapanadze','Male',46,'+99577002025','bulk2025@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-25','2026-04-27',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Lela White','Lela','White','Female',47,'+99577002026','bulk2026@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-26','2026-04-29',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Revaz Kopaliani','Revaz','Kopaliani','Male',48,'+99577002027','bulk2027@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-27','2026-05-01',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Teona Davis','Teona','Davis','Female',49,'+99577002028','bulk2028@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-28','2026-04-30',1,0,1,300.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Dato Avaliani','Dato','Avaliani','Male',50,'+99577002029','bulk2029@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-29','2026-05-02',2,0,1,600.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Manana Clark','Manana','Clark','Female',51,'+99577002030','bulk2030@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-30','2026-05-04',3,0,1,1000.00,@rtSuite,'Card');


-- ── MAY 2026 — 5 Checked-Out + 10 Checked-In + 15 Pending (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'James Elizbarashvili','James','Elizbarashvili','Male',52,'+99577002031','bulk2031@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-29','2026-05-02',1,0,1,240.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Sophie Lewis','Sophie','Lewis','Female',53,'+99577002032','bulk2032@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-30','2026-05-03',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Michael Chikovani','Michael','Chikovani','Male',54,'+99577002033','bulk2033@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-05-01','2026-05-03',3,0,1,220.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Emily Walker','Emily','Walker','Female',55,'+99577002034','bulk2034@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-05-01','2026-05-04',1,0,1,450.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Thomas Jakheli','Thomas','Jakheli','Male',56,'+99577002035','bulk2035@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-05-02','2026-05-04',2,0,1,400.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Anna Hall','Anna','Hall','Female',57,'+99577002036','bulk2036@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-04-29','2026-05-05',3,0,1,1500.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ahmed Charkviani','Ahmed','Charkviani','Male',58,'+99577002037','bulk2037@booktest.ge','UAE');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-04-30','2026-05-06',1,0,1,480.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Fatima Young','Fatima','Young','Female',59,'+99577002038','bulk2038@booktest.ge','UAE');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-01','2026-05-06',2,0,1,600.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Robert Gogoladze','Robert','Gogoladze','Male',60,'+99577002039','bulk2039@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-01','2026-05-07',3,0,1,660.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Marie King','Marie','King','Female',61,'+99577002040','bulk2040@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-02','2026-05-07',1,0,1,750.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Lars Mchedlidze','Lars','Mchedlidze','Male',62,'+99577002041','bulk2041@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-02','2026-05-08',2,0,1,1200.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Emma Lee','Emma','Lee','Female',63,'+99577002042','bulk2042@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-03','2026-05-08',3,0,1,1250.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Pedro Gelashvili','Pedro','Gelashvili','Male',22,'+99577002043','bulk2043@booktest.ge','Portugal');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-03','2026-05-09',1,0,1,480.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Isabella Garcia','Isabella','Garcia','Female',23,'+99577002044','bulk2044@booktest.ge','Italy');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-09',2,0,1,600.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Andrei Kiknadze','Andrei','Kiknadze','Male',24,'+99577002045','bulk2045@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-10',3,0,1,660.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Olga Martinez','Olga','Martinez','Female',25,'+99577002046','bulk2046@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-05','2026-05-07',1,0,1,300.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Mohammed Papuashvili','Mohammed','Papuashvili','Male',26,'+99577002047','bulk2047@booktest.ge','Turkey');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-06','2026-05-09',2,0,1,600.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Layla Rodriguez','Layla','Rodriguez','Female',27,'+99577002048','bulk2048@booktest.ge','Turkey');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-07','2026-05-11',3,0,1,1000.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Li Chelidze','Li','Chelidze','Male',28,'+99577002049','bulk2049@booktest.ge','China');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-08','2026-05-13',1,0,1,400.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Wei Hernandez','Wei','Hernandez','Female',29,'+99577002050','bulk2050@booktest.ge','China');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-09','2026-05-11',2,0,1,240.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Carlos Robakidze','Carlos','Robakidze','Male',30,'+99577002051','bulk2051@booktest.ge','Spain');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-10','2026-05-13',3,0,1,330.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Sofia Lopez','Sofia','Lopez','Female',31,'+99577002052','bulk2052@booktest.ge','Spain');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-12','2026-05-16',1,0,1,600.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ethan Shengelaia','Ethan','Shengelaia','Male',32,'+99577002053','bulk2053@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-14','2026-05-19',2,0,1,1000.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Chloe Gonzalez','Chloe','Gonzalez','Female',33,'+99577002054','bulk2054@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-16','2026-05-18',3,0,1,500.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Oliver Samadashvili','Oliver','Samadashvili','Male',34,'+99577002055','bulk2055@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-18','2026-05-21',1,0,1,240.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Grace Perez','Grace','Perez','Female',35,'+99577002056','bulk2056@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-20','2026-05-24',2,0,1,480.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Hiroshi Kbilashvili','Hiroshi','Kbilashvili','Male',36,'+99577002057','bulk2057@booktest.ge','Japan');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-22','2026-05-27',3,0,1,550.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Yuki Moore','Yuki','Moore','Female',37,'+99577002058','bulk2058@booktest.ge','Japan');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-24','2026-05-26',1,0,1,300.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Jean Jibladze','Jean','Jibladze','Male',38,'+99577002059','bulk2059@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-26','2026-05-29',2,0,1,600.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Clara Jackson','Clara','Jackson','Female',39,'+99577002060','bulk2060@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-28','2026-06-01',3,0,1,1000.00,@rtSuite,'Card');


-- ── JUNE 2026 — Pending (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Giorgi Manjavidze','Giorgi','Manjavidze','Male',40,'+99577002061','bulk2061@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-01','2026-06-03',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nino Harris','Nino','Harris','Female',41,'+99577002062','bulk2062@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-02','2026-06-05',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Luka Chikava','Luka','Chikava','Male',42,'+99577002063','bulk2063@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-03','2026-06-07',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Mariam Miller','Mariam','Miller','Female',43,'+99577002064','bulk2064@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-04','2026-06-09',1,0,1,750.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'David Arabidze','David','Arabidze','Male',44,'+99577002065','bulk2065@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-05','2026-06-07',2,0,1,400.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ana Scott','Ana','Scott','Female',45,'+99577002066','bulk2066@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-06','2026-06-09',3,0,1,750.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tornike Tsitskishvili','Tornike','Tsitskishvili','Male',46,'+99577002067','bulk2067@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-07','2026-06-11',1,0,1,320.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tamar Thomas','Tamar','Thomas','Female',47,'+99577002068','bulk2068@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-08','2026-06-13',2,0,1,600.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Sandro Kvariani','Sandro','Kvariani','Male',48,'+99577002069','bulk2069@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-09','2026-06-11',3,0,1,220.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Elene Adams','Elene','Adams','Female',49,'+99577002070','bulk2070@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-10','2026-06-13',1,0,1,450.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nikoloz Merabishvili','Nikoloz','Merabishvili','Male',50,'+99577002071','bulk2071@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-11','2026-06-15',2,0,1,800.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Salome Baker','Salome','Baker','Female',51,'+99577002072','bulk2072@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-12','2026-06-17',3,0,1,1250.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Irakli Gagnidze','Irakli','Gagnidze','Male',52,'+99577002073','bulk2073@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-13','2026-06-15',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ketevan Nelson','Ketevan','Nelson','Female',53,'+99577002074','bulk2074@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-14','2026-06-17',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Levan Kankava','Levan','Kankava','Male',54,'+99577002075','bulk2075@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-15','2026-06-19',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Natia Carter','Natia','Carter','Female',55,'+99577002076','bulk2076@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-16','2026-06-21',1,0,1,750.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Zaza Chanturia','Zaza','Chanturia','Male',56,'+99577002077','bulk2077@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-17','2026-06-19',2,0,1,400.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Maka Mitchell','Maka','Mitchell','Female',57,'+99577002078','bulk2078@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-18','2026-06-21',3,0,1,750.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Beka Abashidze','Beka','Abashidze','Male',58,'+99577002079','bulk2079@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-19','2026-06-23',1,0,1,320.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ia Perez','Ia','Perez','Female',59,'+99577002080','bulk2080@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-20','2026-06-25',2,0,1,600.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Vakhtang Gigauri','Vakhtang','Gigauri','Male',60,'+99577002081','bulk2081@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-21','2026-06-23',3,0,1,220.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nana Roberts','Nana','Roberts','Female',61,'+99577002082','bulk2082@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-22','2026-06-25',1,0,1,450.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Shota Kvlividze','Shota','Kvlividze','Male',62,'+99577002083','bulk2083@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-23','2026-06-27',2,0,1,800.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Lali Turner','Lali','Turner','Female',63,'+99577002084','bulk2084@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-24','2026-06-29',3,0,1,1250.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Gia Tsikarishvili','Gia','Tsikarishvili','Male',22,'+99577002085','bulk2085@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-25','2026-06-27',1,0,1,160.00,@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Lela Phillips','Lela','Phillips','Female',23,'+99577002086','bulk2086@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-26','2026-06-29',2,0,1,360.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Revaz Mgeladze','Revaz','Mgeladze','Male',24,'+99577002087','bulk2087@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-27','2026-07-01',3,0,1,440.00,@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Teona Campbell','Teona','Campbell','Female',25,'+99577002088','bulk2088@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-28','2026-07-03',1,0,1,750.00,@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Dato Gelbakhiani','Dato','Gelbakhiani','Male',26,'+99577002089','bulk2089@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-29','2026-07-01',2,0,1,400.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Manana Parker','Manana','Parker','Female',27,'+99577002090','bulk2090@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-30','2026-07-03',3,0,1,750.00,@rtSuite,'Card');


-- ════════════════════════════════════════════════════════════════════════
-- HOTEL 2
-- ════════════════════════════════════════════════════════════════════════

-- ── APRIL 2026 — Checked-Out (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Giorgi Beridze','Giorgi','Beridze','Male',22,'+99577002091','bulk2091@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-01','2026-04-03',1,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V01' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Nino Wilson','Nino','Wilson','Female',23,'+99577002092','bulk2092@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-02','2026-04-05',2,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V02' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Luka Nakashidze','Luka','Nakashidze','Male',24,'+99577002093','bulk2093@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-03','2026-04-07',3,0,1,12400.00,(SELECT id FROM rooms WHERE room_number='V03' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Mariam Martin','Mariam','Martin','Female',25,'+99577002094','bulk2094@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-04','2026-04-06',1,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V04' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'David Javakhishvili','David','Javakhishvili','Male',26,'+99577002095','bulk2095@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-05','2026-04-08',2,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V05' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ana Brown','Ana','Brown','Female',27,'+99577002096','bulk2096@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-06','2026-04-10',3,0,1,12400.00,(SELECT id FROM rooms WHERE room_number='V06' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Tornike Gurgenidze','Tornike','Gurgenidze','Male',28,'+99577002097','bulk2097@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-07','2026-04-09',1,0,1,6800.00,(SELECT id FROM rooms WHERE room_number='V07' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Tamar Chen','Tamar','Chen','Female',29,'+99577002098','bulk2098@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-08','2026-04-11',2,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V08' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Sandro Shalikiani','Sandro','Shalikiani','Male',30,'+99577002099','bulk2099@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-09','2026-04-13',3,0,1,13600.00,(SELECT id FROM rooms WHERE room_number='V09' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Elene Johnson','Elene','Johnson','Female',31,'+99577002100','bulk2100@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-10','2026-04-12',1,0,1,6800.00,(SELECT id FROM rooms WHERE room_number='V10' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Nikoloz Khachidze','Nikoloz','Khachidze','Male',32,'+99577002101','bulk2101@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-11','2026-04-14',2,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V11' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Salome Schmidt','Salome','Schmidt','Female',33,'+99577002102','bulk2102@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-12','2026-04-16',3,0,1,17200.00,(SELECT id FROM rooms WHERE room_number='V12' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Irakli Lomidze','Irakli','Lomidze','Male',34,'+99577002103','bulk2103@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-13','2026-04-15',1,0,1,8600.00,(SELECT id FROM rooms WHERE room_number='V13' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ketevan Wagner','Ketevan','Wagner','Female',35,'+99577002104','bulk2104@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-14','2026-04-17',2,0,1,12900.00,(SELECT id FROM rooms WHERE room_number='V14' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Levan Tvaltvadze','Levan','Tvaltvadze','Male',36,'+99577002105','bulk2105@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-15','2026-04-19',3,0,1,17200.00,(SELECT id FROM rooms WHERE room_number='V15' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Natia Alves','Natia','Alves','Female',37,'+99577002106','bulk2106@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-16','2026-04-18',1,0,1,8600.00,(SELECT id FROM rooms WHERE room_number='V16' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Zaza Mikhelidze','Zaza','Mikhelidze','Male',38,'+99577002107','bulk2107@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-17','2026-04-20',2,0,1,12900.00,(SELECT id FROM rooms WHERE room_number='V17' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Maka Hassan','Maka','Hassan','Female',39,'+99577002108','bulk2108@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-18','2026-04-22',3,0,1,20000.00,(SELECT id FROM rooms WHERE room_number='V18' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Beka Basilashvili','Beka','Basilashvili','Male',40,'+99577002109','bulk2109@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-19','2026-04-21',1,0,1,10000.00,(SELECT id FROM rooms WHERE room_number='V19' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ia Taylor','Ia','Taylor','Female',41,'+99577002110','bulk2110@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-20','2026-04-23',2,0,1,15000.00,(SELECT id FROM rooms WHERE room_number='V20' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Vakhtang Gvakharia','Vakhtang','Gvakharia','Male',42,'+99577002111','bulk2111@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-21','2026-04-25',3,0,1,12400.00,(SELECT id FROM rooms WHERE room_number='V01' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Nana Anderson','Nana','Anderson','Female',43,'+99577002112','bulk2112@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-22','2026-04-24',1,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V02' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Shota Subeliani','Shota','Subeliani','Male',44,'+99577002113','bulk2113@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-23','2026-04-26',2,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V03' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Lali Thompson','Lali','Thompson','Female',45,'+99577002114','bulk2114@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-24','2026-04-28',3,0,1,12400.00,(SELECT id FROM rooms WHERE room_number='V04' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Gia Kapanadze','Gia','Kapanadze','Male',46,'+99577002115','bulk2115@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-25','2026-04-27',1,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V05' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Lela White','Lela','White','Female',47,'+99577002116','bulk2116@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-26','2026-04-29',2,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V06' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Revaz Kopaliani','Revaz','Kopaliani','Male',48,'+99577002117','bulk2117@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-27','2026-05-01',3,0,1,13600.00,(SELECT id FROM rooms WHERE room_number='V07' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Teona Davis','Teona','Davis','Female',49,'+99577002118','bulk2118@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-28','2026-04-30',1,0,1,6800.00,(SELECT id FROM rooms WHERE room_number='V08' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Dato Avaliani','Dato','Avaliani','Male',50,'+99577002119','bulk2119@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-29','2026-05-02',2,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V09' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Manana Clark','Manana','Clark','Female',51,'+99577002120','bulk2120@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-30','2026-05-04',3,0,1,13600.00,(SELECT id FROM rooms WHERE room_number='V10' AND hotel_id=2),@rtFamily,'Card');


-- ── MAY 2026 — 5 Checked-Out + 10 Checked-In + 15 Pending (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'James Elizbarashvili','James','Elizbarashvili','Male',52,'+99577002121','bulk2121@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-29','2026-05-02',1,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V11' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Sophie Lewis','Sophie','Lewis','Female',53,'+99577002122','bulk2122@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-30','2026-05-03',2,0,1,12900.00,(SELECT id FROM rooms WHERE room_number='V12' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Michael Chikovani','Michael','Chikovani','Male',54,'+99577002123','bulk2123@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-05-01','2026-05-03',3,0,1,8600.00,(SELECT id FROM rooms WHERE room_number='V13' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Emily Walker','Emily','Walker','Female',55,'+99577002124','bulk2124@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-05-01','2026-05-04',1,0,1,12900.00,(SELECT id FROM rooms WHERE room_number='V14' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Thomas Jakheli','Thomas','Jakheli','Male',56,'+99577002125','bulk2125@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-05-02','2026-05-04',2,0,1,8600.00,(SELECT id FROM rooms WHERE room_number='V15' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Anna Hall','Anna','Hall','Female',57,'+99577002126','bulk2126@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-04-29','2026-05-05',3,0,1,25800.00,(SELECT id FROM rooms WHERE room_number='V16' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ahmed Charkviani','Ahmed','Charkviani','Male',58,'+99577002127','bulk2127@booktest.ge','UAE');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-04-30','2026-05-06',1,0,1,25800.00,(SELECT id FROM rooms WHERE room_number='V17' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Fatima Young','Fatima','Young','Female',59,'+99577002128','bulk2128@booktest.ge','UAE');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-01','2026-05-06',2,0,1,25000.00,(SELECT id FROM rooms WHERE room_number='V18' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Robert Gogoladze','Robert','Gogoladze','Male',60,'+99577002129','bulk2129@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-01','2026-05-07',3,0,1,30000.00,(SELECT id FROM rooms WHERE room_number='V19' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Marie King','Marie','King','Female',61,'+99577002130','bulk2130@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-02','2026-05-07',1,0,1,25000.00,(SELECT id FROM rooms WHERE room_number='V20' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Lars Mchedlidze','Lars','Mchedlidze','Male',62,'+99577002131','bulk2131@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-02','2026-05-08',2,0,1,18600.00,(SELECT id FROM rooms WHERE room_number='V01' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Emma Lee','Emma','Lee','Female',63,'+99577002132','bulk2132@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-03','2026-05-08',3,0,1,15500.00,(SELECT id FROM rooms WHERE room_number='V02' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Pedro Gelashvili','Pedro','Gelashvili','Male',22,'+99577002133','bulk2133@booktest.ge','Portugal');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-03','2026-05-09',1,0,1,18600.00,(SELECT id FROM rooms WHERE room_number='V03' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Isabella Garcia','Isabella','Garcia','Female',23,'+99577002134','bulk2134@booktest.ge','Italy');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-04','2026-05-09',2,0,1,15500.00,(SELECT id FROM rooms WHERE room_number='V04' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Andrei Kiknadze','Andrei','Kiknadze','Male',24,'+99577002135','bulk2135@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-04','2026-05-10',3,0,1,18600.00,(SELECT id FROM rooms WHERE room_number='V05' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Olga Martinez','Olga','Martinez','Female',25,'+99577002136','bulk2136@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-05','2026-05-07',1,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V06' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Mohammed Papuashvili','Mohammed','Papuashvili','Male',26,'+99577002137','bulk2137@booktest.ge','Turkey');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-06','2026-05-09',2,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V07' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Layla Rodriguez','Layla','Rodriguez','Female',27,'+99577002138','bulk2138@booktest.ge','Turkey');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-07','2026-05-11',3,0,1,13600.00,(SELECT id FROM rooms WHERE room_number='V08' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Li Chelidze','Li','Chelidze','Male',28,'+99577002139','bulk2139@booktest.ge','China');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-08','2026-05-13',1,0,1,17000.00,(SELECT id FROM rooms WHERE room_number='V09' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Wei Hernandez','Wei','Hernandez','Female',29,'+99577002140','bulk2140@booktest.ge','China');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-09','2026-05-11',2,0,1,6800.00,(SELECT id FROM rooms WHERE room_number='V10' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Carlos Robakidze','Carlos','Robakidze','Male',30,'+99577002141','bulk2141@booktest.ge','Spain');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-10','2026-05-13',3,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V11' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Sofia Lopez','Sofia','Lopez','Female',31,'+99577002142','bulk2142@booktest.ge','Spain');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-12','2026-05-16',1,0,1,17200.00,(SELECT id FROM rooms WHERE room_number='V12' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ethan Shengelaia','Ethan','Shengelaia','Male',32,'+99577002143','bulk2143@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-14','2026-05-19',2,0,1,21500.00,(SELECT id FROM rooms WHERE room_number='V13' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Chloe Gonzalez','Chloe','Gonzalez','Female',33,'+99577002144','bulk2144@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-16','2026-05-18',3,0,1,8600.00,(SELECT id FROM rooms WHERE room_number='V14' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Oliver Samadashvili','Oliver','Samadashvili','Male',34,'+99577002145','bulk2145@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-18','2026-05-21',1,0,1,12900.00,(SELECT id FROM rooms WHERE room_number='V15' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Grace Perez','Grace','Perez','Female',35,'+99577002146','bulk2146@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-20','2026-05-24',2,0,1,17200.00,(SELECT id FROM rooms WHERE room_number='V16' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Hiroshi Kbilashvili','Hiroshi','Kbilashvili','Male',36,'+99577002147','bulk2147@booktest.ge','Japan');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-22','2026-05-27',3,0,1,21500.00,(SELECT id FROM rooms WHERE room_number='V17' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Yuki Moore','Yuki','Moore','Female',37,'+99577002148','bulk2148@booktest.ge','Japan');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-24','2026-05-26',1,0,1,10000.00,(SELECT id FROM rooms WHERE room_number='V18' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Jean Jibladze','Jean','Jibladze','Male',38,'+99577002149','bulk2149@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-26','2026-05-29',2,0,1,15000.00,(SELECT id FROM rooms WHERE room_number='V19' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Clara Jackson','Clara','Jackson','Female',39,'+99577002150','bulk2150@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-28','2026-06-01',3,0,1,20000.00,(SELECT id FROM rooms WHERE room_number='V20' AND hotel_id=2),@rtPH,'Card');


-- ── JUNE 2026 — Pending (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Giorgi Manjavidze','Giorgi','Manjavidze','Male',40,'+99577002151','bulk2151@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-01','2026-06-03',1,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V01' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Nino Harris','Nino','Harris','Female',41,'+99577002152','bulk2152@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-02','2026-06-05',2,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V02' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Luka Chikava','Luka','Chikava','Male',42,'+99577002153','bulk2153@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-03','2026-06-07',3,0,1,12400.00,(SELECT id FROM rooms WHERE room_number='V03' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Mariam Miller','Mariam','Miller','Female',43,'+99577002154','bulk2154@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-04','2026-06-09',1,0,1,15500.00,(SELECT id FROM rooms WHERE room_number='V04' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'David Arabidze','David','Arabidze','Male',44,'+99577002155','bulk2155@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-05','2026-06-07',2,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V05' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ana Scott','Ana','Scott','Female',45,'+99577002156','bulk2156@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-06','2026-06-09',3,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V06' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Tornike Tsitskishvili','Tornike','Tsitskishvili','Male',46,'+99577002157','bulk2157@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-07','2026-06-11',1,0,1,13600.00,(SELECT id FROM rooms WHERE room_number='V07' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Tamar Thomas','Tamar','Thomas','Female',47,'+99577002158','bulk2158@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-08','2026-06-13',2,0,1,17000.00,(SELECT id FROM rooms WHERE room_number='V08' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Sandro Kvariani','Sandro','Kvariani','Male',48,'+99577002159','bulk2159@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-09','2026-06-11',3,0,1,6800.00,(SELECT id FROM rooms WHERE room_number='V09' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Elene Adams','Elene','Adams','Female',49,'+99577002160','bulk2160@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-10','2026-06-13',1,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V10' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Nikoloz Merabishvili','Nikoloz','Merabishvili','Male',50,'+99577002161','bulk2161@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-11','2026-06-15',2,0,1,13600.00,(SELECT id FROM rooms WHERE room_number='V11' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Salome Baker','Salome','Baker','Female',51,'+99577002162','bulk2162@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-12','2026-06-17',3,0,1,21500.00,(SELECT id FROM rooms WHERE room_number='V12' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Irakli Gagnidze','Irakli','Gagnidze','Male',52,'+99577002163','bulk2163@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-13','2026-06-15',1,0,1,8600.00,(SELECT id FROM rooms WHERE room_number='V13' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ketevan Nelson','Ketevan','Nelson','Female',53,'+99577002164','bulk2164@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-14','2026-06-17',2,0,1,12900.00,(SELECT id FROM rooms WHERE room_number='V14' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Levan Kankava','Levan','Kankava','Male',54,'+99577002165','bulk2165@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-15','2026-06-19',3,0,1,17200.00,(SELECT id FROM rooms WHERE room_number='V15' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Natia Carter','Natia','Carter','Female',55,'+99577002166','bulk2166@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-16','2026-06-21',1,0,1,21500.00,(SELECT id FROM rooms WHERE room_number='V16' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Zaza Chanturia','Zaza','Chanturia','Male',56,'+99577002167','bulk2167@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-17','2026-06-19',2,0,1,8600.00,(SELECT id FROM rooms WHERE room_number='V17' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Maka Mitchell','Maka','Mitchell','Female',57,'+99577002168','bulk2168@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-18','2026-06-21',3,0,1,15000.00,(SELECT id FROM rooms WHERE room_number='V18' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Beka Abashidze','Beka','Abashidze','Male',58,'+99577002169','bulk2169@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-19','2026-06-23',1,0,1,20000.00,(SELECT id FROM rooms WHERE room_number='V19' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ia Perez','Ia','Perez','Female',59,'+99577002170','bulk2170@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-20','2026-06-25',2,0,1,25000.00,(SELECT id FROM rooms WHERE room_number='V20' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Vakhtang Gigauri','Vakhtang','Gigauri','Male',60,'+99577002171','bulk2171@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-21','2026-06-23',3,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V01' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Nana Roberts','Nana','Roberts','Female',61,'+99577002172','bulk2172@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-22','2026-06-25',1,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V02' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Shota Kvlividze','Shota','Kvlividze','Male',62,'+99577002173','bulk2173@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-23','2026-06-27',2,0,1,12400.00,(SELECT id FROM rooms WHERE room_number='V03' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Lali Turner','Lali','Turner','Female',63,'+99577002174','bulk2174@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-24','2026-06-29',3,0,1,15500.00,(SELECT id FROM rooms WHERE room_number='V04' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Gia Tsikarishvili','Gia','Tsikarishvili','Male',22,'+99577002175','bulk2175@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-25','2026-06-27',1,0,1,6200.00,(SELECT id FROM rooms WHERE room_number='V05' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Lela Phillips','Lela','Phillips','Female',23,'+99577002176','bulk2176@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-26','2026-06-29',2,0,1,9300.00,(SELECT id FROM rooms WHERE room_number='V06' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Revaz Mgeladze','Revaz','Mgeladze','Male',24,'+99577002177','bulk2177@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-27','2026-07-01',3,0,1,13600.00,(SELECT id FROM rooms WHERE room_number='V07' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Teona Campbell','Teona','Campbell','Female',25,'+99577002178','bulk2178@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-28','2026-07-03',1,0,1,17000.00,(SELECT id FROM rooms WHERE room_number='V08' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Dato Gelbakhiani','Dato','Gelbakhiani','Male',26,'+99577002179','bulk2179@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-29','2026-07-01',2,0,1,6800.00,(SELECT id FROM rooms WHERE room_number='V09' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Manana Parker','Manana','Parker','Female',27,'+99577002180','bulk2180@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-30','2026-07-03',3,0,1,10200.00,(SELECT id FROM rooms WHERE room_number='V10' AND hotel_id=2),@rtFamily,'Card');


-- ════════════════════════════════════════════════════════════════════════
-- HOTEL 3
-- ════════════════════════════════════════════════════════════════════════

-- ── APRIL 2026 — Checked-Out (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Giorgi Beridze','Giorgi','Beridze','Male',22,'+99577002181','bulk2181@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-01','2026-04-03',1,0,1,156.00,(SELECT id FROM rooms WHERE room_number='101' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Nino Wilson','Nino','Wilson','Female',23,'+99577002182','bulk2182@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-02','2026-04-05',2,0,1,234.00,(SELECT id FROM rooms WHERE room_number='102' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Luka Nakashidze','Luka','Nakashidze','Male',24,'+99577002183','bulk2183@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-03','2026-04-07',3,0,1,312.00,(SELECT id FROM rooms WHERE room_number='103' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Mariam Martin','Mariam','Martin','Female',25,'+99577002184','bulk2184@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-04','2026-04-06',1,0,1,156.00,(SELECT id FROM rooms WHERE room_number='104' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'David Javakhishvili','David','Javakhishvili','Male',26,'+99577002185','bulk2185@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-05','2026-04-08',2,0,1,234.00,(SELECT id FROM rooms WHERE room_number='105' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ana Brown','Ana','Brown','Female',27,'+99577002186','bulk2186@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-06','2026-04-10',3,0,1,312.00,(SELECT id FROM rooms WHERE room_number='106' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Tornike Gurgenidze','Tornike','Gurgenidze','Male',28,'+99577002187','bulk2187@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-07','2026-04-09',1,0,1,156.00,(SELECT id FROM rooms WHERE room_number='107' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Tamar Chen','Tamar','Chen','Female',29,'+99577002188','bulk2188@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-08','2026-04-11',2,0,1,234.00,(SELECT id FROM rooms WHERE room_number='108' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Sandro Shalikiani','Sandro','Shalikiani','Male',30,'+99577002189','bulk2189@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-09','2026-04-13',3,0,1,540.00,(SELECT id FROM rooms WHERE room_number='201' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Elene Johnson','Elene','Johnson','Female',31,'+99577002190','bulk2190@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-10','2026-04-12',1,0,1,270.00,(SELECT id FROM rooms WHERE room_number='202' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Nikoloz Khachidze','Nikoloz','Khachidze','Male',32,'+99577002191','bulk2191@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-11','2026-04-14',2,0,1,405.00,(SELECT id FROM rooms WHERE room_number='203' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Salome Schmidt','Salome','Schmidt','Female',33,'+99577002192','bulk2192@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-12','2026-04-16',3,0,1,540.00,(SELECT id FROM rooms WHERE room_number='204' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Irakli Lomidze','Irakli','Lomidze','Male',34,'+99577002193','bulk2193@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-13','2026-04-15',1,0,1,270.00,(SELECT id FROM rooms WHERE room_number='205' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ketevan Wagner','Ketevan','Wagner','Female',35,'+99577002194','bulk2194@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-14','2026-04-17',2,0,1,405.00,(SELECT id FROM rooms WHERE room_number='206' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Levan Tvaltvadze','Levan','Tvaltvadze','Male',36,'+99577002195','bulk2195@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-15','2026-04-19',3,0,1,540.00,(SELECT id FROM rooms WHERE room_number='207' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Natia Alves','Natia','Alves','Female',37,'+99577002196','bulk2196@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-16','2026-04-18',1,0,1,270.00,(SELECT id FROM rooms WHERE room_number='208' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Zaza Mikhelidze','Zaza','Mikhelidze','Male',38,'+99577002197','bulk2197@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-17','2026-04-20',2,0,1,318.00,(SELECT id FROM rooms WHERE room_number='301' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Maka Hassan','Maka','Hassan','Female',39,'+99577002198','bulk2198@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-18','2026-04-22',3,0,1,424.00,(SELECT id FROM rooms WHERE room_number='302' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Beka Basilashvili','Beka','Basilashvili','Male',40,'+99577002199','bulk2199@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-19','2026-04-21',1,0,1,212.00,(SELECT id FROM rooms WHERE room_number='303' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ia Taylor','Ia','Taylor','Female',41,'+99577002200','bulk2200@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-20','2026-04-23',2,0,1,318.00,(SELECT id FROM rooms WHERE room_number='304' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Vakhtang Gvakharia','Vakhtang','Gvakharia','Male',42,'+99577002201','bulk2201@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-21','2026-04-25',3,0,1,424.00,(SELECT id FROM rooms WHERE room_number='305' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Nana Anderson','Nana','Anderson','Female',43,'+99577002202','bulk2202@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-22','2026-04-24',1,0,1,212.00,(SELECT id FROM rooms WHERE room_number='306' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Shota Subeliani','Shota','Subeliani','Male',44,'+99577002203','bulk2203@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-23','2026-04-26',2,0,1,318.00,(SELECT id FROM rooms WHERE room_number='307' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Lali Thompson','Lali','Thompson','Female',45,'+99577002204','bulk2204@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-24','2026-04-28',3,0,1,424.00,(SELECT id FROM rooms WHERE room_number='308' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Gia Kapanadze','Gia','Kapanadze','Male',46,'+99577002205','bulk2205@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-25','2026-04-27',1,0,1,310.00,(SELECT id FROM rooms WHERE room_number='309' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Lela White','Lela','White','Female',47,'+99577002206','bulk2206@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-26','2026-04-29',2,0,1,465.00,(SELECT id FROM rooms WHERE room_number='310' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Revaz Kopaliani','Revaz','Kopaliani','Male',48,'+99577002207','bulk2207@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-27','2026-05-01',3,0,1,620.00,(SELECT id FROM rooms WHERE room_number='311' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Teona Davis','Teona','Davis','Female',49,'+99577002208','bulk2208@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-28','2026-04-30',1,0,1,310.00,(SELECT id FROM rooms WHERE room_number='312' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Dato Avaliani','Dato','Avaliani','Male',50,'+99577002209','bulk2209@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-29','2026-05-02',2,0,1,615.00,(SELECT id FROM rooms WHERE room_number='401' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Manana Clark','Manana','Clark','Female',51,'+99577002210','bulk2210@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-30','2026-05-04',3,0,1,820.00,(SELECT id FROM rooms WHERE room_number='402' AND hotel_id=3),@rtFamily,'Card');


-- ── MAY 2026 — 5 Checked-Out + 10 Checked-In + 15 Pending (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'James Elizbarashvili','James','Elizbarashvili','Male',52,'+99577002211','bulk2211@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-29','2026-05-02',1,0,1,615.00,(SELECT id FROM rooms WHERE room_number='403' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Sophie Lewis','Sophie','Lewis','Female',53,'+99577002212','bulk2212@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-30','2026-05-03',2,0,1,615.00,(SELECT id FROM rooms WHERE room_number='404' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Michael Chikovani','Michael','Chikovani','Male',54,'+99577002213','bulk2213@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-05-01','2026-05-03',3,0,1,410.00,(SELECT id FROM rooms WHERE room_number='405' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Emily Walker','Emily','Walker','Female',55,'+99577002214','bulk2214@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-05-01','2026-05-04',1,0,1,615.00,(SELECT id FROM rooms WHERE room_number='406' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Thomas Jakheli','Thomas','Jakheli','Male',56,'+99577002215','bulk2215@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-05-02','2026-05-04',2,0,1,410.00,(SELECT id FROM rooms WHERE room_number='407' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Anna Hall','Anna','Hall','Female',57,'+99577002216','bulk2216@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-04-29','2026-05-05',3,0,1,1230.00,(SELECT id FROM rooms WHERE room_number='408' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ahmed Charkviani','Ahmed','Charkviani','Male',58,'+99577002217','bulk2217@booktest.ge','UAE');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-04-30','2026-05-06',1,0,1,2280.00,(SELECT id FROM rooms WHERE room_number='409' AND hotel_id=3),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Fatima Young','Fatima','Young','Female',59,'+99577002218','bulk2218@booktest.ge','UAE');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-01','2026-05-06',2,0,1,1900.00,(SELECT id FROM rooms WHERE room_number='410' AND hotel_id=3),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Robert Gogoladze','Robert','Gogoladze','Male',60,'+99577002219','bulk2219@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-01','2026-05-07',3,0,1,468.00,(SELECT id FROM rooms WHERE room_number='101' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Marie King','Marie','King','Female',61,'+99577002220','bulk2220@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-02','2026-05-07',1,0,1,390.00,(SELECT id FROM rooms WHERE room_number='102' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Lars Mchedlidze','Lars','Mchedlidze','Male',62,'+99577002221','bulk2221@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-02','2026-05-08',2,0,1,468.00,(SELECT id FROM rooms WHERE room_number='103' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Emma Lee','Emma','Lee','Female',63,'+99577002222','bulk2222@booktest.ge','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-03','2026-05-08',3,0,1,390.00,(SELECT id FROM rooms WHERE room_number='104' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Pedro Gelashvili','Pedro','Gelashvili','Male',22,'+99577002223','bulk2223@booktest.ge','Portugal');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-03','2026-05-09',1,0,1,468.00,(SELECT id FROM rooms WHERE room_number='105' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Isabella Garcia','Isabella','Garcia','Female',23,'+99577002224','bulk2224@booktest.ge','Italy');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-04','2026-05-09',2,0,1,390.00,(SELECT id FROM rooms WHERE room_number='106' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Andrei Kiknadze','Andrei','Kiknadze','Male',24,'+99577002225','bulk2225@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-04','2026-05-10',3,0,1,468.00,(SELECT id FROM rooms WHERE room_number='107' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Olga Martinez','Olga','Martinez','Female',25,'+99577002226','bulk2226@booktest.ge','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-05','2026-05-07',1,0,1,156.00,(SELECT id FROM rooms WHERE room_number='108' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Mohammed Papuashvili','Mohammed','Papuashvili','Male',26,'+99577002227','bulk2227@booktest.ge','Turkey');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-06','2026-05-09',2,0,1,405.00,(SELECT id FROM rooms WHERE room_number='201' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Layla Rodriguez','Layla','Rodriguez','Female',27,'+99577002228','bulk2228@booktest.ge','Turkey');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-07','2026-05-11',3,0,1,540.00,(SELECT id FROM rooms WHERE room_number='202' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Li Chelidze','Li','Chelidze','Male',28,'+99577002229','bulk2229@booktest.ge','China');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-08','2026-05-13',1,0,1,675.00,(SELECT id FROM rooms WHERE room_number='203' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Wei Hernandez','Wei','Hernandez','Female',29,'+99577002230','bulk2230@booktest.ge','China');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-09','2026-05-11',2,0,1,270.00,(SELECT id FROM rooms WHERE room_number='204' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Carlos Robakidze','Carlos','Robakidze','Male',30,'+99577002231','bulk2231@booktest.ge','Spain');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-10','2026-05-13',3,0,1,405.00,(SELECT id FROM rooms WHERE room_number='205' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Sofia Lopez','Sofia','Lopez','Female',31,'+99577002232','bulk2232@booktest.ge','Spain');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-12','2026-05-16',1,0,1,540.00,(SELECT id FROM rooms WHERE room_number='206' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ethan Shengelaia','Ethan','Shengelaia','Male',32,'+99577002233','bulk2233@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-14','2026-05-19',2,0,1,675.00,(SELECT id FROM rooms WHERE room_number='207' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Chloe Gonzalez','Chloe','Gonzalez','Female',33,'+99577002234','bulk2234@booktest.ge','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-16','2026-05-18',3,0,1,270.00,(SELECT id FROM rooms WHERE room_number='208' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Oliver Samadashvili','Oliver','Samadashvili','Male',34,'+99577002235','bulk2235@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-18','2026-05-21',1,0,1,318.00,(SELECT id FROM rooms WHERE room_number='301' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Grace Perez','Grace','Perez','Female',35,'+99577002236','bulk2236@booktest.ge','UK');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-20','2026-05-24',2,0,1,424.00,(SELECT id FROM rooms WHERE room_number='302' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Hiroshi Kbilashvili','Hiroshi','Kbilashvili','Male',36,'+99577002237','bulk2237@booktest.ge','Japan');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-22','2026-05-27',3,0,1,530.00,(SELECT id FROM rooms WHERE room_number='303' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Yuki Moore','Yuki','Moore','Female',37,'+99577002238','bulk2238@booktest.ge','Japan');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-24','2026-05-26',1,0,1,212.00,(SELECT id FROM rooms WHERE room_number='304' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Jean Jibladze','Jean','Jibladze','Male',38,'+99577002239','bulk2239@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-26','2026-05-29',2,0,1,318.00,(SELECT id FROM rooms WHERE room_number='305' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Clara Jackson','Clara','Jackson','Female',39,'+99577002240','bulk2240@booktest.ge','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-28','2026-06-01',3,0,1,424.00,(SELECT id FROM rooms WHERE room_number='306' AND hotel_id=3),@rtTwin,'Card');


-- ── JUNE 2026 — Pending (30) ──
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Giorgi Manjavidze','Giorgi','Manjavidze','Male',40,'+99577002241','bulk2241@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-01','2026-06-03',1,0,1,212.00,(SELECT id FROM rooms WHERE room_number='307' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Nino Harris','Nino','Harris','Female',41,'+99577002242','bulk2242@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-02','2026-06-05',2,0,1,318.00,(SELECT id FROM rooms WHERE room_number='308' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Luka Chikava','Luka','Chikava','Male',42,'+99577002243','bulk2243@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-03','2026-06-07',3,0,1,620.00,(SELECT id FROM rooms WHERE room_number='309' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Mariam Miller','Mariam','Miller','Female',43,'+99577002244','bulk2244@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-04','2026-06-09',1,0,1,775.00,(SELECT id FROM rooms WHERE room_number='310' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'David Arabidze','David','Arabidze','Male',44,'+99577002245','bulk2245@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-05','2026-06-07',2,0,1,310.00,(SELECT id FROM rooms WHERE room_number='311' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ana Scott','Ana','Scott','Female',45,'+99577002246','bulk2246@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-06','2026-06-09',3,0,1,465.00,(SELECT id FROM rooms WHERE room_number='312' AND hotel_id=3),@rtTriple,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Tornike Tsitskishvili','Tornike','Tsitskishvili','Male',46,'+99577002247','bulk2247@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-07','2026-06-11',1,0,1,820.00,(SELECT id FROM rooms WHERE room_number='401' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Tamar Thomas','Tamar','Thomas','Female',47,'+99577002248','bulk2248@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-08','2026-06-13',2,0,1,1025.00,(SELECT id FROM rooms WHERE room_number='402' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Sandro Kvariani','Sandro','Kvariani','Male',48,'+99577002249','bulk2249@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-09','2026-06-11',3,0,1,410.00,(SELECT id FROM rooms WHERE room_number='403' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Elene Adams','Elene','Adams','Female',49,'+99577002250','bulk2250@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-10','2026-06-13',1,0,1,615.00,(SELECT id FROM rooms WHERE room_number='404' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Nikoloz Merabishvili','Nikoloz','Merabishvili','Male',50,'+99577002251','bulk2251@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-11','2026-06-15',2,0,1,820.00,(SELECT id FROM rooms WHERE room_number='405' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Salome Baker','Salome','Baker','Female',51,'+99577002252','bulk2252@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-12','2026-06-17',3,0,1,1025.00,(SELECT id FROM rooms WHERE room_number='406' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Irakli Gagnidze','Irakli','Gagnidze','Male',52,'+99577002253','bulk2253@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-13','2026-06-15',1,0,1,410.00,(SELECT id FROM rooms WHERE room_number='407' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ketevan Nelson','Ketevan','Nelson','Female',53,'+99577002254','bulk2254@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-14','2026-06-17',2,0,1,615.00,(SELECT id FROM rooms WHERE room_number='408' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Levan Kankava','Levan','Kankava','Male',54,'+99577002255','bulk2255@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-15','2026-06-19',3,0,1,1520.00,(SELECT id FROM rooms WHERE room_number='409' AND hotel_id=3),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Natia Carter','Natia','Carter','Female',55,'+99577002256','bulk2256@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-16','2026-06-21',1,0,1,1900.00,(SELECT id FROM rooms WHERE room_number='410' AND hotel_id=3),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Zaza Chanturia','Zaza','Chanturia','Male',56,'+99577002257','bulk2257@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-17','2026-06-19',2,0,1,156.00,(SELECT id FROM rooms WHERE room_number='101' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Maka Mitchell','Maka','Mitchell','Female',57,'+99577002258','bulk2258@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-18','2026-06-21',3,0,1,234.00,(SELECT id FROM rooms WHERE room_number='102' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Beka Abashidze','Beka','Abashidze','Male',58,'+99577002259','bulk2259@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-19','2026-06-23',1,0,1,312.00,(SELECT id FROM rooms WHERE room_number='103' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ia Perez','Ia','Perez','Female',59,'+99577002260','bulk2260@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-20','2026-06-25',2,0,1,390.00,(SELECT id FROM rooms WHERE room_number='104' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Vakhtang Gigauri','Vakhtang','Gigauri','Male',60,'+99577002261','bulk2261@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-21','2026-06-23',3,0,1,156.00,(SELECT id FROM rooms WHERE room_number='105' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Nana Roberts','Nana','Roberts','Female',61,'+99577002262','bulk2262@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-22','2026-06-25',1,0,1,234.00,(SELECT id FROM rooms WHERE room_number='106' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Shota Kvlividze','Shota','Kvlividze','Male',62,'+99577002263','bulk2263@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-23','2026-06-27',2,0,1,312.00,(SELECT id FROM rooms WHERE room_number='107' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Lali Turner','Lali','Turner','Female',63,'+99577002264','bulk2264@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-24','2026-06-29',3,0,1,390.00,(SELECT id FROM rooms WHERE room_number='108' AND hotel_id=3),@rtSingle,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Gia Tsikarishvili','Gia','Tsikarishvili','Male',22,'+99577002265','bulk2265@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-25','2026-06-27',1,0,1,270.00,(SELECT id FROM rooms WHERE room_number='201' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Lela Phillips','Lela','Phillips','Female',23,'+99577002266','bulk2266@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-26','2026-06-29',2,0,1,405.00,(SELECT id FROM rooms WHERE room_number='202' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Revaz Mgeladze','Revaz','Mgeladze','Male',24,'+99577002267','bulk2267@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-27','2026-07-01',3,0,1,540.00,(SELECT id FROM rooms WHERE room_number='203' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Teona Campbell','Teona','Campbell','Female',25,'+99577002268','bulk2268@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-28','2026-07-03',1,0,1,675.00,(SELECT id FROM rooms WHERE room_number='204' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Dato Gelbakhiani','Dato','Gelbakhiani','Male',26,'+99577002269','bulk2269@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-29','2026-07-01',2,0,1,270.00,(SELECT id FROM rooms WHERE room_number='205' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Manana Parker','Manana','Parker','Female',27,'+99577002270','bulk2270@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-30','2026-07-03',3,0,1,405.00,(SELECT id FROM rooms WHERE room_number='206' AND hotel_id=3),@rtDouble,'Card');


-- ─────────────────────────────────────────────────────────────────────────────
--  Test Bookings Seed  |  Hotels 1, 2, 3
--  NOTE: 'nights' is a computed persisted column — not included in INSERTs
-- ─────────────────────────────────────────────────────────────────────────────

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

-- ════ HOTEL 1 ════════════════════════════════════════════════════════════════
DECLARE @h1user INT = COALESCE((SELECT TOP 1 id FROM users WHERE hotel_id = 1),(SELECT TOP 1 id FROM users));

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Giorgi Beridze','Giorgi','Beridze','Male',32,'+995591100001','g.beridze@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-20','2026-04-25',2,0,1,600.00,@rtDouble,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nino Kvaratskhelia','Nino','Kvaratskhelia','Female',27,'+995599100002','n.kvaratskhelia@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedOut,@h1user,'2026-04-28','2026-05-02',1,0,1,1200.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Luka Nakashidze','Luka','Nakashidze','Male',24,'+995598100003','l.nakashidze@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-02','2026-05-07',1,0,1,400.00,@rtSingle,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Mariam Tsiklauri','Mariam','Tsiklauri','Female',38,'+995577100004','mariam.tsiklauri@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-03','2026-05-09',2,2,1,1200.00,@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'David Javakhishvili','David','Javakhishvili','Male',45,'+995555100005','d.javakhishvili@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-09',2,0,1,600.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ana Gurgenidze','Ana','Gurgenidze','Female',30,'+995599100006','ana.gurgenidze@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-08',2,0,1,440.00,@rtTwin,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tornike Shalikiani','Tornike','Shalikiani','Male',41,'+995558100007','t.shalikiani@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-08','2026-05-13',1,0,1,1500.00,@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tamar Khachidze','Tamar','Khachidze','Female',22,'+995591100008','tamar.khachidze@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-10','2026-05-14',1,0,1,320.00,@rtSingle,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Sandro Lomidze','Sandro','Lomidze','Male',35,'+995577100009','s.lomidze@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-20','2026-05-25',2,0,1,600.00,@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Elena Stepanova','Elena','Stepanova','Female',36,'+995599100010','elena.stepanova@gmail.com','Russia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-06-05','2026-06-10',2,1,1,1000.00,@rtFamily,'Card');

-- ════ HOTEL 2 ════════════════════════════════════════════════════════════════
DECLARE @h2user INT = COALESCE((SELECT TOP 1 id FROM users WHERE hotel_id = 2),(SELECT TOP 1 id FROM users));

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'James Wilson','James','Wilson','Male',48,'+447700100011','j.wilson@email.co.uk','United Kingdom');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-22','2026-04-27',2,0,1,15500.00,(SELECT id FROM rooms WHERE room_number='V03' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Sophie Martin','Sophie','Martin','Female',34,'+33612100012','s.martin@gmail.com','France');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedOut,@h2user,'2026-04-29','2026-05-03',2,0,1,16400.00,(SELECT id FROM rooms WHERE room_number='V14' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Michael Brown','Michael','Brown','Male',42,'+12125100013','m.brown@email.com','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-01','2026-05-07',2,2,1,20400.00,(SELECT id FROM rooms WHERE room_number='V09' AND hotel_id=2),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Levan Tvaltvadze','Levan','Tvaltvadze','Male',38,'+995598100014','l.tvaltvadze@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-03','2026-05-08',2,0,1,16500.00,(SELECT id FROM rooms WHERE room_number='V05' AND hotel_id=2),@rtDeluxe,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Tamara Mikhelidze','Tamara','Mikhelidze','Female',29,'+995577100015','t.mikhelidze@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sCheckedIn,@h2user,'2026-05-04','2026-05-09',1,0,1,21500.00,(SELECT id FROM rooms WHERE room_number='V16' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Robert Johnson','Robert','Johnson','Male',55,'+12025100016','r.johnson@email.com','USA');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-04','2026-05-08',2,0,1,20000.00,(SELECT id FROM rooms WHERE room_number='V19' AND hotel_id=2),@rtPH,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ana Basilashvili','Ana','Basilashvili','Female',33,'+995591100017','ana.basilashvili@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-06','2026-05-11',2,1,1,19000.00,(SELECT id FROM rooms WHERE room_number='V11' AND hotel_id=2),@rtFamily,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Lasha Gvakharia','Lasha','Gvakharia','Male',37,'+995555100018','l.gvakharia@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-12','2026-05-17',2,0,1,16000.00,(SELECT id FROM rooms WHERE room_number='V02' AND hotel_id=2),@rtDeluxe,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Emily Chen','Emily','Chen','Female',31,'+85291100019','emily.chen@email.com','China');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-05-22','2026-05-27',2,0,1,21000.00,(SELECT id FROM rooms WHERE room_number='V13' AND hotel_id=2),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (2,'Ahmed Hassan','Ahmed','Hassan','Male',44,'+97150100020','ahmed.hassan@email.ae','UAE');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (2,@gId,@sPending,@h2user,'2026-06-01','2026-06-06',2,0,1,23000.00,(SELECT id FROM rooms WHERE room_number='V18' AND hotel_id=2),@rtPH,'Card');

-- ════ HOTEL 3 ════════════════════════════════════════════════════════════════
DECLARE @h3user INT = COALESCE((SELECT TOP 1 id FROM users WHERE hotel_id = 3),(SELECT TOP 1 id FROM users));

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Ketevan Subeliani','Ketevan','Subeliani','Female',26,'+995591100021','k.subeliani@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-18','2026-04-22',1,0,1,312.00,(SELECT id FROM rooms WHERE room_number='103' AND hotel_id=3),@rtSingle,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Zaza Kapanadze','Zaza','Kapanadze','Male',40,'+995598100022','z.kapanadze@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-25','2026-04-30',2,0,1,675.00,(SELECT id FROM rooms WHERE room_number='203' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Irina Kopaliani','Irina','Kopaliani','Female',29,'+995577100023','irina.kopaliani@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedOut,@h3user,'2026-04-30','2026-05-03',2,0,1,318.00,(SELECT id FROM rooms WHERE room_number='302' AND hotel_id=3),@rtTwin,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Beka Avaliani','Beka','Avaliani','Male',33,'+995599100024','b.avaliani@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-02','2026-05-07',3,0,1,775.00,(SELECT id FROM rooms WHERE room_number='308' AND hotel_id=3),@rtTriple,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Natia Elizbarashvili','Natia','Elizbarashvili','Female',35,'+995558100025','natia.elizbarashvili@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-03','2026-05-09',2,2,1,1230.00,(SELECT id FROM rooms WHERE room_number='403' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Giorgi Chikovani','Giorgi','Chikovani','Male',43,'+995591100026','g.chikovani@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-04','2026-05-08',2,0,1,516.00,(SELECT id FROM rooms WHERE room_number='205' AND hotel_id=3),@rtDouble,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Lisa Schmidt','Lisa','Schmidt','Female',39,'+491751100027','l.schmidt@email.de','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sCheckedIn,@h3user,'2026-05-04','2026-05-07',2,0,1,1140.00,(SELECT id FROM rooms WHERE room_number='409' AND hotel_id=3),@rtSuite,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Nika Jakheli','Nika','Jakheli','Male',22,'+995597100028','nika.jakheli@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-04','2026-05-06',1,0,1,158.00,(SELECT id FROM rooms WHERE room_number='107' AND hotel_id=3),@rtSingle,'Cash');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Maka Charkviani','Maka','Charkviani','Female',28,'+995555100029','m.charkviani@mail.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-07','2026-05-11',2,0,1,416.00,(SELECT id FROM rooms WHERE room_number='305' AND hotel_id=3),@rtTwin,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Pedro Alves','Pedro','Alves','Male',36,'+351921100030','p.alves@email.pt','Portugal');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-14','2026-05-19',2,0,1,610.00,(SELECT id FROM rooms WHERE room_number='204' AND hotel_id=3),@rtDouble,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Elene Gogoladze','Elene','Gogoladze','Female',32,'+995591100031','elene.gogoladze@gmail.com','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-05-20','2026-05-26',2,1,1,1200.00,(SELECT id FROM rooms WHERE room_number='405' AND hotel_id=3),@rtFamily,'Card');

INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (3,'Thomas Wagner','Thomas','Wagner','Male',47,'+491761100032','t.wagner@email.de','Germany');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,room_id,requested_room_type_id,requested_payment_method) VALUES (3,@gId,@sPending,@h3user,'2026-06-10','2026-06-15',2,0,1,2100.00,(SELECT id FROM rooms WHERE room_number='410' AND hotel_id=3),@rtSuite,'Card');

-- Mark occupied rooms as unavailable
UPDATE rooms SET is_available = 0 WHERE hotel_id = 2 AND room_number IN ('V05','V09','V16');
UPDATE rooms SET is_available = 0 WHERE hotel_id = 3 AND room_number IN ('205','308','403','409');

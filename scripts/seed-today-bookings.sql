-- ─────────────────────────────────────────────────────────────────────────────
--  45 Today Bookings Seed  |  Hotel 1  |  check_in = 2026-05-04
--  nights is computed persisted — not included in INSERTs
-- ─────────────────────────────────────────────────────────────────────────────

DECLARE @sPending    INT = (SELECT TOP 1 id FROM booking_status WHERE is_active = 1 ORDER BY sort_order ASC);
DECLARE @sCheckedIn  INT = (SELECT TOP 1 id FROM booking_status WHERE LOWER(name_eng) LIKE '%check%' AND LOWER(name_eng) LIKE '%in%' AND LOWER(name_eng) NOT LIKE '%out%');
DECLARE @rtSingle  INT = (SELECT id FROM room_type WHERE name_eng = 'Single Room');
DECLARE @rtDouble  INT = (SELECT id FROM room_type WHERE name_eng = 'Double Room');
DECLARE @rtTwin    INT = (SELECT id FROM room_type WHERE name_eng = 'Twin Room');
DECLARE @rtTriple  INT = (SELECT id FROM room_type WHERE name_eng = 'Triple Room');
DECLARE @rtFamily  INT = (SELECT id FROM room_type WHERE name_eng = 'Family Room');
DECLARE @rtSuite   INT = (SELECT id FROM room_type WHERE name_eng = 'Suite');
DECLARE @h1user INT = COALESCE((SELECT TOP 1 id FROM users WHERE hotel_id = 1),(SELECT TOP 1 id FROM users));
DECLARE @gId INT;

-- [1] Giorgi Beridze | Single | 2026-05-04 → 2026-05-05
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Giorgi Beridze','Giorgi','Beridze','Male',22,'+995591100100','today001@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-05',2,0,1,80.00,@rtSingle,'Cash');

-- [2] Nino Kvaratskhelia | Double | 2026-05-04 → 2026-05-06
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nino Kvaratskhelia','Nino','Kvaratskhelia','Female',23,'+995591100101','today002@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-06',2,0,1,240.00,@rtDouble,'Card');

-- [3] Luka Nakashidze | Twin | 2026-05-04 → 2026-05-07
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Luka Nakashidze','Luka','Nakashidze','Male',24,'+995591100102','today003@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-07',1,0,1,330.00,@rtTwin,'Cash');

-- [4] Mariam Tsiklauri | Triple | 2026-05-04 → 2026-05-08
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Mariam Tsiklauri','Mariam','Tsiklauri','Male',25,'+995591100103','today004@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-08',1,0,1,640.00,@rtTriple,'Card');

-- [5] David Javakhishvili | Family | 2026-05-04 → 2026-05-09
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'David Javakhishvili','David','Javakhishvili','Female',26,'+995591100104','today005@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-09',3,1,1,1000.00,@rtFamily,'Cash');

-- [6] Ana Gurgenidze | Suite | 2026-05-04 → 2026-05-10
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ana Gurgenidze','Ana','Gurgenidze','Male',27,'+995591100105','today006@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-10',1,0,1,1800.00,@rtSuite,'Card');

-- [7] Tornike Shalikiani | Single | 2026-05-04 → 2026-05-11
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tornike Shalikiani','Tornike','Shalikiani','Male',28,'+995591100106','today007@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-11',2,0,1,560.00,@rtSingle,'Cash');

-- [8] Tamar Khachidze | Double | 2026-05-04 → 2026-05-05
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tamar Khachidze','Tamar','Khachidze','Female',29,'+995591100107','today008@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-05',2,0,1,120.00,@rtDouble,'Card');

-- [9] Sandro Lomidze | Twin | 2026-05-04 → 2026-05-06
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Sandro Lomidze','Sandro','Lomidze','Male',30,'+995591100108','today009@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-06',1,0,1,220.00,@rtTwin,'Cash');

-- [10] Elena Stepanova | Triple | 2026-05-04 → 2026-05-07
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Elena Stepanova','Elena','Stepanova','Male',31,'+995591100109','today010@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-07',1,0,1,480.00,@rtTriple,'Card');

-- [11] Irakli Abuladze | Family | 2026-05-04 → 2026-05-08
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Irakli Abuladze','Irakli','Abuladze','Female',32,'+995591100110','today011@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-08',3,1,1,800.00,@rtFamily,'Cash');

-- [12] Keti Gigauri | Suite | 2026-05-04 → 2026-05-09
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Keti Gigauri','Keti','Gigauri','Male',33,'+995591100111','today012@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-09',1,0,1,1500.00,@rtSuite,'Card');

-- [13] Levan Chikvania | Single | 2026-05-04 → 2026-05-10
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Levan Chikvania','Levan','Chikvania','Male',34,'+995591100112','today013@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-10',2,0,1,480.00,@rtSingle,'Cash');

-- [14] Salome Mikhelidze | Double | 2026-05-04 → 2026-05-11
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Salome Mikhelidze','Salome','Mikhelidze','Female',35,'+995591100113','today014@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-11',2,0,1,840.00,@rtDouble,'Card');

-- [15] Beka Maisuradze | Twin | 2026-05-04 → 2026-05-05
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Beka Maisuradze','Beka','Maisuradze','Male',36,'+995591100114','today015@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-05',1,0,1,110.00,@rtTwin,'Cash');

-- [16] Nana Andronikashvili | Triple | 2026-05-04 → 2026-05-06
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nana Andronikashvili','Nana','Andronikashvili','Male',37,'+995591100115','today016@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-06',1,0,1,320.00,@rtTriple,'Card');

-- [17] Zura Koplatadze | Family | 2026-05-04 → 2026-05-07
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Zura Koplatadze','Zura','Koplatadze','Female',38,'+995591100116','today017@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-07',3,1,1,600.00,@rtFamily,'Cash');

-- [18] Maka Geladze | Suite | 2026-05-04 → 2026-05-08
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Maka Geladze','Maka','Geladze','Male',39,'+995591100117','today018@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-08',1,0,1,1200.00,@rtSuite,'Card');

-- [19] Nika Dvalishvili | Single | 2026-05-04 → 2026-05-09
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nika Dvalishvili','Nika','Dvalishvili','Male',40,'+995591100118','today019@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-09',2,0,1,400.00,@rtSingle,'Cash');

-- [20] Lela Kobakhidze | Double | 2026-05-04 → 2026-05-10
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Lela Kobakhidze','Lela','Kobakhidze','Female',41,'+995591100119','today020@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-10',2,0,1,720.00,@rtDouble,'Card');

-- [21] Mikheil Tvaltvadze | Twin | 2026-05-04 → 2026-05-11
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Mikheil Tvaltvadze','Mikheil','Tvaltvadze','Male',42,'+995591100120','today021@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-11',1,0,1,770.00,@rtTwin,'Cash');

-- [22] Rusudan Sikharulidze | Triple | 2026-05-04 → 2026-05-05
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Rusudan Sikharulidze','Rusudan','Sikharulidze','Male',43,'+995591100121','today022@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-05',1,0,1,160.00,@rtTriple,'Card');

-- [23] Giorgi Tatanashvili | Family | 2026-05-04 → 2026-05-06
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Giorgi Tatanashvili','Giorgi','Tatanashvili','Female',44,'+995591100122','today023@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-06',3,1,1,400.00,@rtFamily,'Cash');

-- [24] Tamara Asatiani | Suite | 2026-05-04 → 2026-05-07
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tamara Asatiani','Tamara','Asatiani','Male',45,'+995591100123','today024@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-07',1,0,1,900.00,@rtSuite,'Card');

-- [25] Shota Laghidze | Single | 2026-05-04 → 2026-05-08
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Shota Laghidze','Shota','Laghidze','Male',46,'+995591100124','today025@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-08',2,0,1,320.00,@rtSingle,'Cash');

-- [26] Manana Metreveli | Double | 2026-05-04 → 2026-05-09
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Manana Metreveli','Manana','Metreveli','Female',47,'+995591100125','today026@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-09',2,0,1,600.00,@rtDouble,'Card');

-- [27] Vakhtang Chelidze | Twin | 2026-05-04 → 2026-05-10
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Vakhtang Chelidze','Vakhtang','Chelidze','Male',48,'+995591100126','today027@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-10',1,0,1,660.00,@rtTwin,'Cash');

-- [28] Mzia Zurabiani | Triple | 2026-05-04 → 2026-05-11
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Mzia Zurabiani','Mzia','Zurabiani','Male',49,'+995591100127','today028@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-11',1,0,1,1120.00,@rtTriple,'Card');

-- [29] Kakha Khomeriki | Family | 2026-05-04 → 2026-05-05
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Kakha Khomeriki','Kakha','Khomeriki','Female',50,'+995591100128','today029@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-05',3,1,1,200.00,@rtFamily,'Cash');

-- [30] Nino Bregvadze | Suite | 2026-05-04 → 2026-05-06
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Nino Bregvadze','Nino','Bregvadze','Male',51,'+995591100129','today030@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sCheckedIn,@h1user,'2026-05-04','2026-05-06',1,0,1,600.00,@rtSuite,'Card');

-- [31] Archil Gelashvili | Single | 2026-05-04 → 2026-05-07
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Archil Gelashvili','Archil','Gelashvili','Male',52,'+995591100130','today031@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-07',2,0,1,240.00,@rtSingle,'Cash');

-- [32] Tina Tskhvediani | Double | 2026-05-04 → 2026-05-08
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Tina Tskhvediani','Tina','Tskhvediani','Female',53,'+995591100131','today032@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-08',2,0,1,480.00,@rtDouble,'Card');

-- [33] Giorgi Esebua | Twin | 2026-05-04 → 2026-05-09
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Giorgi Esebua','Giorgi','Esebua','Male',54,'+995591100132','today033@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-09',1,0,1,550.00,@rtTwin,'Cash');

-- [34] Ia Janelidze | Triple | 2026-05-04 → 2026-05-10
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Ia Janelidze','Ia','Janelidze','Male',55,'+995591100133','today034@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-10',1,0,1,960.00,@rtTriple,'Card');

-- [35] Revaz Chikvaidze | Family | 2026-05-04 → 2026-05-11
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Revaz Chikvaidze','Revaz','Chikvaidze','Female',56,'+995591100134','today035@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-11',3,1,1,1400.00,@rtFamily,'Cash');

-- [36] Kato Sulaberidze | Suite | 2026-05-04 → 2026-05-05
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Kato Sulaberidze','Kato','Sulaberidze','Male',57,'+995591100135','today036@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-05',1,0,1,300.00,@rtSuite,'Card');

-- [37] Gio Mchedlishvili | Single | 2026-05-04 → 2026-05-06
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Gio Mchedlishvili','Gio','Mchedlishvili','Male',58,'+995591100136','today037@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-06',2,0,1,160.00,@rtSingle,'Cash');

-- [38] Dea Barnabishvili | Double | 2026-05-04 → 2026-05-07
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Dea Barnabishvili','Dea','Barnabishvili','Female',59,'+995591100137','today038@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-07',2,0,1,360.00,@rtDouble,'Card');

-- [39] Saba Papuashvili | Twin | 2026-05-04 → 2026-05-08
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Saba Papuashvili','Saba','Papuashvili','Male',60,'+995591100138','today039@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-08',1,0,1,440.00,@rtTwin,'Cash');

-- [40] Elene Kuchava | Triple | 2026-05-04 → 2026-05-09
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Elene Kuchava','Elene','Kuchava','Male',61,'+995591100139','today040@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-09',1,0,1,800.00,@rtTriple,'Card');

-- [41] Badri Topuria | Family | 2026-05-04 → 2026-05-10
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Badri Topuria','Badri','Topuria','Female',22,'+995591100140','today041@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-10',3,1,1,1200.00,@rtFamily,'Cash');

-- [42] Meri Qoiava | Suite | 2026-05-04 → 2026-05-11
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Meri Qoiava','Meri','Qoiava','Male',23,'+995591100141','today042@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-11',1,0,1,2100.00,@rtSuite,'Card');

-- [43] Akaki Goderdzishvili | Single | 2026-05-04 → 2026-05-05
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Akaki Goderdzishvili','Akaki','Goderdzishvili','Male',24,'+995591100142','today043@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-05',2,0,1,80.00,@rtSingle,'Cash');

-- [44] Dali Lezhava | Double | 2026-05-04 → 2026-05-06
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Dali Lezhava','Dali','Lezhava','Female',25,'+995591100143','today044@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-06',2,0,1,240.00,@rtDouble,'Card');

-- [45] Zurab Baramidze | Twin | 2026-05-04 → 2026-05-07
INSERT INTO guests (hotel_id,full_name,first_name,last_name,gender,age,phone,email,country) VALUES (1,'Zurab Baramidze','Zurab','Baramidze','Male',26,'+995591100144','today045@booktest.ge','Georgia');
SET @gId = SCOPE_IDENTITY();
INSERT INTO bookings (hotel_id,guest_id,status_id,created_by,check_in,check_out,guests_count,kids_count,rooms_count,total_price,requested_room_type_id,requested_payment_method) VALUES (1,@gId,@sPending,@h1user,'2026-05-04','2026-05-07',1,0,1,330.00,@rtTwin,'Cash');

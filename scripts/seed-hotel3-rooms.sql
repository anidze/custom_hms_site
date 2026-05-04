-- ─────────────────────────────────────────────────────────────
--  Hotel ID = 3  |  40 Rooms  |  4 Floors
--  Room types: Single Room (8), Double Room (8), Twin Room (8),
--              Triple Room (4), Family Room (10), Suite (2)
-- ─────────────────────────────────────────────────────────────

INSERT INTO rooms (room_number, floor, description, price_per_night, is_available, room_type_id, hotel_id)
VALUES

-- ── Single Room (8 rooms — Floor 1) ──────────────────────────
('101', 1, 'Cozy single room with city view, queen bed, work desk',         80.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),
('102', 1, 'Single room with en-suite bathroom and natural lighting',       75.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),
('103', 1, 'Single room, compact and modern, ideal for solo travelers',     78.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),
('104', 1, 'Single room with garden-facing window and wardrobe',            76.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),
('105', 1, 'Single room with smart TV, AC and complimentary breakfast',     80.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),
('106', 1, 'Single room on quiet wing, blackout curtains, fast WiFi',       74.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),
('107', 1, 'Corner single room with extra natural light and balcony',       82.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),
('108', 1, 'Single room with rainfall shower and premium toiletries',       79.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Single Room'), 3),

-- ── Double Room (8 rooms — Floor 1 & 2) ─────────────────────
('109', 1, 'Double room with king bed, panoramic city view',               120.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),
('110', 1, 'Double room with en-suite jacuzzi and premium bedding',        130.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),
('201', 2, 'Double room with private balcony and mountain view',           125.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),
('202', 2, 'Double room, queen bed, lounge area and mini-bar',             128.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),
('203', 2, 'Double room with fireplace, romantic setup on request',        135.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),
('204', 2, 'Double room with floor-to-ceiling windows, park view',         122.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),
('205', 2, 'Double room with walk-in shower and spa-grade amenities',      129.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),
('206', 2, 'Double room, corner unit, dual aspect views, king bed',        132.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Double Room'), 3),

-- ── Twin Room (8 rooms — Floor 2 & 3) ───────────────────────
('207', 2, 'Twin room with two single beds and shared balcony',            110.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),
('208', 2, 'Twin room with garden view, ideal for colleagues or friends',  105.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),
('301', 3, 'Twin room with city view, two beds with premium linen',        108.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),
('302', 3, 'Twin room with spacious wardrobe, work desk and lounge chair', 106.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),
('303', 3, 'Twin room, quiet wing, blackout curtains and rain shower',     107.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),
('304', 3, 'Twin room with mountain-facing window and reading nook',       109.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),
('305', 3, 'Twin room with smart lighting, two single beds and AC',        104.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),
('306', 3, 'Twin room with connecting door option and private bathroom',   112.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Twin Room'), 3),

-- ── Triple Room (4 rooms — Floor 3) ─────────────────────────
('307', 3, 'Triple room with one double and one single bed, city view',    160.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Triple Room'), 3),
('308', 3, 'Triple room with three single beds and large wardrobe',        155.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Triple Room'), 3),
('309', 3, 'Triple room with balcony, sofa-bed and mountain panorama',     165.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Triple Room'), 3),
('310', 3, 'Triple room, spacious layout, extra bathroom on request',      158.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Triple Room'), 3),

-- ── Family Room (10 rooms — Floor 3 & 4) ────────────────────
('311', 3, 'Family room with master bed, bunk beds and kids corner',       200.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('312', 3, 'Family room with two bedrooms, shared living area',            210.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('401', 4, 'Family room with large terrace, 2 bathrooms and garden view',  220.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('402', 4, 'Family room with kitchenette, sofa-bed and mountain view',     215.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('403', 4, 'Family room, open-plan layout, king bed and twin beds',        205.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('404', 4, 'Family room with panoramic windows, play area and mini-bar',   218.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('405', 4, 'Family room with breakfast included, cozy living room',        200.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('406', 4, 'Family room with two connecting rooms and shared balcony',     212.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('407', 4, 'Family room with private terrace, hammock and city skyline',   225.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),
('408', 4, 'Family room, 3-bed layout, rainfall shower and smart TV',      208.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 3),

-- ── Suite (2 rooms — Floor 4) ────────────────────────────────
('409', 4, 'Executive suite with panoramic view, jacuzzi and lounge area', 380.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 3),
('410', 4, 'Presidential suite with private terrace, butler on request',   420.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 3);

-- ─────────────────────────────────────────────────────────────
--  Hotel ID = 2  |  20 Villa Rooms  |  No floors (NULL)
--  Room types: Deluxe Room, Suite, Family Room, Penthouse
--  Prices: 3000 – 5000 GEL / night
-- ─────────────────────────────────────────────────────────────

INSERT INTO rooms (room_number, floor, description, price_per_night, is_available, room_type_id, hotel_id)
VALUES

-- ── Deluxe Room (6 villas) ────────────────────────────────────
('V01', NULL, 'Deluxe villa with private garden and mountain view',       3000.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Deluxe Room'), 2),
('V02', NULL, 'Deluxe villa with outdoor heated pool and terrace',        3200.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Deluxe Room'), 2),
('V03', NULL, 'Deluxe villa, king bed, fireplace, forest panorama',       3100.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Deluxe Room'), 2),
('V04', NULL, 'Deluxe villa with private jacuzzi and sun deck',           3400.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Deluxe Room'), 2),
('V05', NULL, 'Deluxe villa overlooking vineyard, butler service',        3300.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Deluxe Room'), 2),
('V06', NULL, 'Deluxe villa with floor-to-ceiling windows, lake view',    3500.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Deluxe Room'), 2),

-- ── Family Room (5 villas) ────────────────────────────────────
('V07', NULL, 'Spacious family villa, 2 bedrooms, kids play area',        3200.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 2),
('V08', NULL, 'Family villa with bunk room, private garden, BBQ zone',    3000.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 2),
('V09', NULL, 'Family villa, 3 bedrooms, large living area, mountain view', 3400.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 2),
('V10', NULL, 'Family villa with heated pool, games room, terrace',       3600.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 2),
('V11', NULL, 'Family villa, 2 bathrooms, outdoor cinema, forest edge',   3800.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Family Room'), 2),

-- ── Suite (6 villas) ─────────────────────────────────────────
('V12', NULL, 'Suite villa with panoramic glass walls and infinity pool', 4000.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 2),
('V13', NULL, 'Suite villa, master bedroom, private spa, valley view',    4200.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 2),
('V14', NULL, 'Suite villa with rooftop terrace and wine cellar',         4100.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 2),
('V15', NULL, 'Suite villa, open-plan kitchen, private chef on request',  4400.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 2),
('V16', NULL, 'Suite villa, wraparound deck, outdoor fireplace',          4300.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 2),
('V17', NULL, 'Suite villa with heated lap pool and cinema lounge',       4500.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Suite'), 2),

-- ── Penthouse (3 villas) ──────────────────────────────────────
('V18', NULL, 'Penthouse villa, dual-level, 360° mountain panorama',      4800.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Penthouse'), 2),
('V19', NULL, 'Penthouse villa with private helipad and butler suite',    5000.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Penthouse'), 2),
('V20', NULL, 'Penthouse villa, infinity pool, Caucasus ridge views',     4600.00, 1, (SELECT id FROM room_type WHERE name_eng = 'Penthouse'), 2);

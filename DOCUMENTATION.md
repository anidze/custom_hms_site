# HMS — Hotel Management System — სრული დოკუმენტაცია

> **ეს დოკუმენტი განკუთვნილია დამწყები დეველოპერებისთვის.**  
> ყველაფერი ახსნილია ნაბიჯ-ნაბიჯ, ისე, თითქოს გაკვეთილს ვეწყობი.

---

## სარჩევი

1. [რა არის ეს პროექტი?](#1-რა-არის-ეს-პროექტი)
2. [გამოყენებული ტექნოლოგიები](#2-გამოყენებული-ტექნოლოგიები)
3. [პროექტის სტრუქტურა](#3-პროექტის-სტრუქტურა)
4. [როგორ იწყება პროგრამა?](#4-როგორ-იწყება-პროგრამა)
5. [მონაცემთა ბაზასთან კავშირი (db.ts)](#5-მონაცემთა-ბაზასთან-კავშირი-dbts)
6. [სესია და ავტორიზაცია (session.ts)](#6-სესია-და-ავტორიზაცია-sessionts)
7. [მარშრუტების დაცვა (proxy.ts)](#7-მარშრუტების-დაცვა-proxyts)
8. [ავტენტიფიკაციის API](#8-ავტენტიფიკაციის-api)
9. [სხვა API endpoint-ები](#9-სხვა-api-endpoint-ები)
10. [Frontend გვერდები](#10-frontend-გვერდები)
11. [კომპონენტები](#11-კომპონენტები)
12. [მთელი ნაკადი — ნაბიჯ ნაბიჯ](#12-მთელი-ნაკადი--ნაბიჯ-ნაბიჯ)
13. [მონაცემთა ბაზის სქემა](#13-მონაცემთა-ბაზის-სქემა)

---

## 1. რა არის ეს პროექტი?

**HMS** (Hotel Management System) არის სასტუმროს მართვის სისტემა. პროგრამა საშუალებას აძლევს სასტუმროს თანამშრომლებს:

- დარეგისტრირდნენ და გავიდნენ სისტემაში
- ნახონ ნომრების სია (Rooms)
- შექმნან, ნახონ და შეცვალონ ჯავშნები (Reservations / Bookings)
- მართონ სტუმრების ინფორმაცია (Guests)
- ნახონ Dashboard სტატისტიკა

ეს არის **full-stack** პროგრამა — ანუ ერთ კოდბაზაში გვაქვს როგორც ბრაუზერში გაშვებული ნაწილი (Frontend), ასევე სერვერზე გაშვებული ნაწილი (Backend), ყველაფერი Next.js-ით.

---

## 2. გამოყენებული ტექნოლოგიები

| ტექნოლოგია | დანიშნულება |
|---|---|
| **Next.js 16** | React-ზე დაფუძნებული full-stack ფრეიმვორკი |
| **React 19** | UI კომპონენტების ბიბლიოთეკა |
| **TypeScript** | JavaScript + ტიპები (შეცდომებისგან დასაცავად) |
| **Tailwind CSS 4** | სტილები პირდაპირ HTML-ში კლასების სახით |
| **mssql** | Microsoft SQL Server-თან სამუშაო ბიბლიოთეკა |
| **bcryptjs** | პაროლის დაშიფვრა |
| **jose** | JWT ტოკენების შექმნა და გადამოწმება |
| **lucide-react** | მზა იკონები (Search, BedDouble და ა.შ.) |
| **recharts** | გრაფიკები Dashboard-ზე |
| **country-state-city** | ქვეყნების, ქალაქების სია ჯავშნის ფორმაში |

### რატომ Next.js?

Next.js-ში ერთ პროექტში გვაქვს:
- **React გვერდები** — ბრაუზერში ნაჩვენები UI
- **API Route-ები** — სერვერული ფუნქციები, რომლებიც ბაზასთან საუბრობენ

ეს ნიშნავს, რომ ჩვენ **ცალკე backend სერვერი არ გვჭირდება**. ყველაფერი ერთ `next dev` ბრძანებით იწყება.

---

## 3. პროექტის სტრუქტურა

```
HMS/
├── package.json              ← პროექტის კონფიგურაცია, დეპენდენსები
├── next.config.ts            ← Next.js კონფიგურაცია
├── tsconfig.json             ← TypeScript კონფიგურაცია
├── postcss.config.mjs        ← Tailwind CSS კონფიგურაცია
│
└── src/
    ├── proxy.ts              ← Middleware — გვერდების დაცვა
    │
    ├── app/                  ← Next.js App Router (ყველა გვერდი და API)
    │   ├── globals.css       ← გლობალური სტილები
    │   ├── layout.tsx        ← Root layout (HTML სტრუქტურა)
    │   ├── page.tsx          ← Root გვერდი (/ → /login redirect)
    │   │
    │   ├── login/page.tsx    ← შესვლის გვერდი
    │   ├── register/page.tsx ← რეგისტრაციის გვერდი
    │   │
    │   ├── (dashboard)/      ← Dashboard სექცია (ფრჩხილები = route group)
    │   │   ├── layout.tsx    ← Dashboard layout (Sidebar + Header)
    │   │   ├── dashboard/    ← მთავარი dashboard გვერდი
    │   │   ├── frontdesk/    ← ფრონტდეკი
    │   │   ├── reservations/ ← ჯავშნების სია
    │   │   │   ├── new/      ← ახალი ჯავშნის შექმნა
    │   │   │   └── [id]/edit/← ჯავშნის რედაქტირება
    │   │   ├── rooms/        ← ნომრების სია
    │   │   ├── housekeeping/ ← დასუფთავება
    │   │   ├── invoice/      ← ინვოისი
    │   │   └── reports/      ← ანგარიშები
    │   │
    │   └── api/              ← Backend API endpoint-ები
    │       ├── auth/
    │       │   ├── login/    ← POST /api/auth/login
    │       │   ├── register/ ← POST /api/auth/register
    │       │   └── logout/   ← POST /api/auth/logout
    │       ├── hotels/       ← GET /api/hotels
    │       ├── rooms/        ← GET /api/rooms
    │       ├── reservations/ ← GET /api/reservations
    │       └── bookings/     ← POST /api/bookings, GET/PUT /api/bookings/[id]
    │
    ├── components/           ← გამოყენებადი React კომპონენტები
    │   ├── LoginForm.tsx
    │   ├── RegisterForm.tsx
    │   ├── navbar/
    │   │   ├── Sidebar.tsx
    │   │   └── TopHeader.tsx
    │   └── rooms/
    │       └── RoomsClient.tsx
    │
    └── lib/                  ← გამოყენებადი ლოგიკა
        ├── db.ts             ← SQL Server კავშირი
        ├── session.ts        ← JWT ტოკენის ლოგიკა
        └── test-mssql.ts     ← ტესტი ბაზასთან კავშირის შესამოწმებლად
```

### მნიშვნელოვანი კონვენცია — `(dashboard)` ფოლდერი

`(dashboard)` ფრჩხილებში ჩაწერილი სახელი Next.js-ს ეუბნება:
> "ეს არის **route group** — URL-ში ეს სახელი ნუ გამოჩნდება"

ანუ `/dashboard`, `/rooms`, `/reservations` — ყველა მათი სრული URL, მაგრამ ყველა ერთ `layout.tsx`-ს (Sidebar + Header) იყენებს.

---

## 4. როგორ იწყება პროგრამა?

### ნაბიჯი 1 — `npm run dev`

ეს ბრძანება Next.js-ის development სერვერს ამუშავებს.

### ნაბიჯი 2 — ბრაუზერი მიდის `http://localhost:3000`

Next.js იხედება `src/app/page.tsx`-ში:

```typescript
// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/login");
}
```

**ახსნა:** Root გვერდი (`/`) მყისიერად გადამისამართებს `/login`-ზე. ანუ, ვინც ვებსაიტს გახსნის, პირდაპირ შესვლის ფორმაზე მოხვდება.

### ნაბიჯი 3 — Root Layout

სანამ რომელიმე გვერდი გამოჩნდება, `src/app/layout.tsx` სრულდება:

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

**ახსნა:** ეს HTML-ის ჩონჩხია. `{children}` — ეს არის ადგილი, სადაც კონკრეტული გვერდი ჩაიდება. ყველა გვერდი ამ HTML სტრუქტურაში "ჩაიდება".

---

## 5. მონაცემთა ბაზასთან კავშირი (db.ts)

ფაილი: `src/lib/db.ts`

```typescript
import sql from 'mssql';

function parseDatabaseUrl(url: string): sql.config {
    const withoutScheme = url.replace(/^sqlserver:\/\//, '');
    const parts = withoutScheme.split(';');
    const [host, portStr] = parts[0].split(':');
    const port = portStr ? parseInt(portStr, 10) : 1433;
    // ... პარამეტრების გარჩევა
    return {
        server: host,
        port,
        database: params['database'] ?? 'master',
        user: params['user'],
        password: params['password'],
        options: {
            enableArithAbort: true,
            trustServerCertificate: params['trustservercertificate'] === 'true',
        },
        pool: {
            max: 10,    // მაქსიმუმ 10 ერთდროული კავშირი
            min: 0,     // მინიმუმ 0 (იწყება საჭიროებისამებრ)
            idleTimeoutMillis: 30000, // 30 წამი უმოქმედობის შემდეგ დახურვა
        },
    };
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export const getDB = () => {
    if (poolPromise) return poolPromise;  // ← უკვე არსებული კავშირი დაბრუნდება
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');
    const config = parseDatabaseUrl(dbUrl);
    poolPromise = new sql.ConnectionPool(config).connect()...
    return poolPromise;
};
```

### რა ხდება აქ ნაბიჯ-ნაბიჯ?

**1. `DATABASE_URL` გარემოს ცვლადი**

ბაზის მისამართი `.env` ფაილში ინახება (უსაფრთხოების მიზნით კოდში არ წერია):
```
DATABASE_URL=sqlserver://localhost:1433;database=HotelDB;user=sa;password=MyPass;trustServerCertificate=true
```

**2. `parseDatabaseUrl` ფუნქცია**

ეს ფუნქცია ამ სტრიქონს გარდაქმნის `mssql` ბიბლიოთეკისთვის გასაგებ ობიექტად:
```
"sqlserver://localhost:1433;database=HotelDB;..."
           ↓
{ server: "localhost", port: 1433, database: "HotelDB", ... }
```

**3. Connection Pool**

Connection Pool = კავშირების "აუზი". წარმოიდგინე, რომ სასტუმრო 100 სტუმარს ემსახურება. თუ ყველა სტუმარი ერთდროულად ბაზისკენ "დარბოდა", გადატვირთვა მოხდებოდა. Pool ქმნის `max: 10` მზა კავშირს და ახდენს მათ გამოყენებას რიგრიგობით.

**4. `if (poolPromise) return poolPromise`**

ეს მნიშვნელოვანია! პირველ ჯერზე კავშირი იქმნება. შემდეგ ყველა მოთხოვნა **ერთ და იმავე** კავშირს იყენებს. ბაზასთან ყოველ ჯერზე ახალი კავშირი ძალიან ნელი იქნებოდა.

---

## 6. სესია და ავტორიზაცია (session.ts)

ფაილი: `src/lib/session.ts`

```typescript
import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: number;
  email: string;
  fullName: string;
  hotelId: number;
  roleId: number;
  hotelName: string;
}

function getKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")  // ← 8 საათის შემდეგ ვიადება
    .sign(getKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;  // ← ვადაგასული ან ყალბი ტოკენი → null
  }
}
```

### JWT — რა არის ეს?

**JWT** (JSON Web Token) — ეს არის დაშიფრული სტრიქონი, რომელიც მომხმარებლის ინფორმაციას შეიცავს.

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AaG90ZWwuY29tIn0.xK3a...
     ↑ Header              ↑ Payload (userId, email, hotelId...)              ↑ Signature
```

**პრინციპი:**
1. მომხმარებელი შედის სისტემაში → სერვერი ქმნის JWT ტოკენს
2. ტოკენი Cookie-ში ინახება ბრაუზერში (`hms-session`)
3. ყოველ მომდევნო მოთხოვნაზე ბრაუზერი ამ Cookie-ს ავტომატურად გზავნის
4. სერვერი ამოწმებს ტოკენს და `JWT_SECRET`-ით ადასტურებს, რომ ნამდვილია

**Cookie პარამეტრები:**
```typescript
cookieStore.set("hms-session", token, {
  httpOnly: true,   // JavaScript-ს ვერ წაიკითხავს (XSS-ისგან დაცვა)
  secure: process.env.NODE_ENV === "production", // HTTPS-ზე პროდქშენში
  sameSite: "lax",  // CSRF-ისგან დაცვა
  maxAge: 60 * 60 * 8, // 8 საათი (წამებში)
  path: "/",        // მთელ საიტზე მოქმედებს
});
```

---

## 7. მარშრუტების დაცვა (proxy.ts)

ფაილი: `src/proxy.ts`

```typescript
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/hotels",
];

const AUTH_ONLY_PATHS = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static ფაილები — შეეხება და გაუშვა
  if (pathname.startsWith("/_next") || pathname.startsWith("/images")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  // შესული მომხმარებელი login/register-ზე მოდის → dashboard-ზე გაგზავნა
  if (session && AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // შეუსული მომხმარებელი დაცულ გვერდს ითხოვს → login-ზე გაგზავნა
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (!session && !isPublic) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    if (token) response.cookies.delete("hms-session"); // ვადაგასული cookie წაშლა
    return response;
  }

  return NextResponse.next(); // გაუშვა
}
```

### ეს არის "კარის მცველი"

წარმოიდგინე, სასტუმროს შესასვლელში დარაჯი დგას. **ყოველი მოთხოვნა** (ყოველი URL) გადის ამ ფუნქციის გავლით:

```
მომხმარებელი → /dashboard
      ↓
proxy() — ჩექი: Cookie გაქვს?
  ❌ Cookie არ არის → redirect /login
  ✅ Cookie არის → ადასტუ ტოკენი
       ❌ ვადაგასული → redirect /login
       ✅ მოქმედია → გაუშვი /dashboard-ზე
```

**`config.matcher`** ეუბნება Next.js-ს, რომელ გზებზე გაუშვას ეს middleware:
```typescript
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```
ანუ: ყველა URL-ზე, გარდა Next.js-ის შიდა სტატიკური ფაილებისა.

---

## 8. ავტენტიფიკაციის API

### 8.1 — შესვლა: `POST /api/auth/login`

ფაილი: `src/app/api/auth/login/route.ts`

**ნაბიჯ-ნაბიჯ:**

```
1. ბრაუზერი გზავნის: { email: "admin@hotel.com", password: "pass123" }
2. სერვერი ამოწმებს: email და password მოვიდა?
3. ბაზაში ეძებს users ცხრილში ამ email-ს
4. bcrypt.compare() — პაროლი სწორია?
5. is_active = 1 — ანგარიში აქტიურია?
6. last_login_at-ს განაახლებს (GETDATE())
7. JWT ტოკენს ქმნის { userId, email, fullName, hotelId, roleId, hotelName }
8. Cookie-ში ჩაწერს "hms-session"
9. ბრაუზერს უბრუნებს { success: true }
```

**SQL Query:**
```sql
SELECT u.id, u.email, u.password_hash, u.is_active,
       u.full_name, u.hotel_id, u.role_id,
       h.name AS hotel_name
FROM users u
LEFT JOIN hotels h ON h.id = u.hotel_id
WHERE u.email = @email
```

`LEFT JOIN` — სასტუმროს სახელსაც ვიღებთ ერთ query-ში.

**Parameterized Query — უსაფრთხოება:**
```typescript
.input("email", email.toLowerCase().trim())
.query("... WHERE u.email = @email")
```
`@email` — ეს **SQL Injection-ისგან დაცვის** მეთოდია. პარამეტრი ცალკე გადაეცემა, ანუ მომხმარებელი ვერ ჩაწერს `'; DROP TABLE users; --` სახის კოდს.

---

### 8.2 — რეგისტრაცია: `POST /api/auth/register`

ფაილი: `src/app/api/auth/register/route.ts`

**ნაბიჯ-ნაბიჯ:**

```
1. ბრაუზერი გზავნის: { full_name, email, password, hotel_id }
2. ვალიდაცია: ყველა ველი მოვიდა? პაროლი ≥ 8 სიმბოლო?
3. ბაზაში ემეილი უკვე რეგისტრირებულია? → 409 Conflict შეცდომა
4. hotel_id არსებობს ბაზაში? → validation
5. 'RECEPTIONIST' role-ს id-ს ვეძებთ user_role ცხრილში
6. bcrypt.hash(password, 12) — პაროლს ვაშიფრავთ (12 = სიძნელე)
7. users ცხრილში ვჩდივართ ახალ ჩანაწერს
8. { success: true, userId } ვაბრუნებთ
```

**bcrypt-ის ახსნა:**

```
"pass123"  →  bcrypt.hash(12)  →  "$2b$12$K8bHM4..."
```

`12` — ეს **cost factor** (სიძნელე). რაც მეტია, მით ნელია (უსაფრთხო). 12 — კარგი ბალანსი სიჩქარეს და უსაფრთხოებას შორის.

**მნიშვნელოვანი:** ბაზაში **პაროლი არასდროს ინახება ტექსტის სახით** — მხოლოდ hash.

---

### 8.3 — გამოსვლა: `POST /api/auth/logout`

ფაილი: `src/app/api/auth/logout/route.ts`

```typescript
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("hms-session");  // Cookie-ს წაშლა = გამოსვლა
  return NextResponse.json({ success: true });
}
```

მარტივია: Cookie-ს წაშლა = შემდეგ მოთხოვნაზე სესია ვეღარ დადასტურდება = გამოსვლა.

---

## 9. სხვა API endpoint-ები

### 9.1 — სასტუმროების სია: `GET /api/hotels`

ფაილი: `src/app/api/hotels/route.ts`

**ეს endpoint ღიაა (ავტორიზაცია არ სჭირდება)**, რადგან რეგისტრაციის ფორმაში სასტუმროების dropdown-ი გვჭირდება.

```sql
SELECT id, name, city 
FROM hotels 
WHERE is_active = 1 
ORDER BY name ASC
```

---

### 9.2 — ნომრების სია: `GET /api/rooms`

ფაილი: `src/app/api/rooms/route.ts`

**ავტორიზაცია სავალდებულოა.** სესიიდან `hotelId`-ს ვიღებთ — ანუ ყოველი მომხმარებელი **მხოლოდ საკუთარი სასტუმროს** ნომრებს ხედავს.

```sql
SELECT r.id, r.room_number, r.floor, rt.name_eng AS room_type_name
FROM rooms r
LEFT JOIN room_type rt ON rt.id = r.room_type_id
WHERE r.hotel_id = @hotel_id
ORDER BY r.room_number ASC
```

---

### 9.3 — ჯავშნების სია: `GET /api/reservations`

ფაილი: `src/app/api/reservations/route.ts`

**URL პარამეტრი:** `?tab=checkin` ან `?tab=checkout`

```typescript
const tab = searchParams.get("tab");

let whereClause = "b.hotel_id = @hotel_id";
if (tab === "checkin") {
  whereClause += " AND b.check_in >= CAST(GETDATE() AS DATE)";
} else if (tab === "checkout") {
  whereClause += " AND b.check_out >= CAST(GETDATE() AS DATE)";
}
```

Tab-ის მიხედვით SQL query-ში პირობა ემატება. `CAST(GETDATE() AS DATE)` — დღევანდელი თარიღი (დრო გარეშე).

**მნიშვნელოვანი SQL ნაწილი — bookingNo:**
```sql
'AL' + RIGHT('0000' + CAST(b.id AS VARCHAR(10)), 4) AS bookingNo
```
ეს ქმნის: `AL0001`, `AL0023`, `AL0150` — ლამაზ ჯავშნის ნომრებს id-დან.

**გადახდის სტატუსი:**
```sql
ISNULL((SELECT SUM(p.amount) FROM payments p WHERE p.booking_id = b.id), 0) AS paidAmount
```
Sub-query — ყოველი ჯავშნისთვის payments ცხრილიდან გადახდილი თანხის ჯამი.

---

### 9.4 — ჯავშნის შექმნა: `POST /api/bookings`

ფაილი: `src/app/api/bookings/route.ts`

ეს ყველაზე რთული endpoint-ია. **5 ნაბიჯი:**

```
ნაბიჯი 1: guests ცხრილში ახალი სტუმარი ჩაიწერება
ნაბიჯი 2: room_type ცხრილიდან ოთახის ტიპის id-ს ვიპოვით
ნაბიჯი 3: booking_status ცხრილიდან default სტატუსს ვიპოვით
ნაბიჯი 4: bookings ცხრილში ჯავშანი ჩაიწერება
ნაბიჯი 5: AdditionalGuests ცხრილში დამატებითი სტუმრები ჩაიწერება
```

**თარიღის კონვერტაცია:**
```typescript
function parseDate(d: string): string {
  const parts = d.split("-");
  if (parts.length === 3 && parts[0].length === 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return d;
}
```
Frontend-ი გზავნის `DD-MM-YYYY`, SQL Server-ს `YYYY-MM-DD` სჭირდება.

---

### 9.5 — ჯავშნის GET/PUT: `/api/bookings/[id]`

ფაილი: `src/app/api/bookings/[id]/route.ts`

**`[id]` — Dynamic Route.** ეს ნიშნავს, `/api/bookings/42` → `id = "42"`.

```typescript
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookingId = parseInt(id);
  // ...
}
```

**Ownership Check — უსაფრთხოება:**
```typescript
const owns = await pool
  .request()
  .input("id", sql.Int, bookingId)
  .input("hotel_id", sql.Int, session.hotelId)
  .query("SELECT id FROM bookings WHERE id = @id AND hotel_id = @hotel_id");

if (owns.recordset.length === 0) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
```
ეს ადასტურებს, რომ ჯავშანი **სწორედ ამ სასტუმროს ეკუთვნის**. მომხმარებელი ვერ ნახავს სხვა სასტუმროს ჯავშნებს id-ის ხელით შეცვლით.

---

## 10. Frontend გვერდები

### 10.1 — შესვლის გვერდი (`/login`)

ფაილი: `src/app/login/page.tsx`

```typescript
// Server Component (ნაგულისხმევი)
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <LoginForm />
    </div>
  );
}
```

**Server Component vs Client Component:**
- **Server Component** — სერვერზე render-დება, HTML-ს ბრაუზერს გზავნის. ნელი interactive-ი.
- **Client Component** (`"use client"` ზედა) — ბრაუზერში სრულდება, state, event handlers შეუძლია.

`LoginPage` — server component, მხოლოდ HTML სტრუქტურა.
`LoginForm` — client component, `useState`, `onClick` და ა.შ.

---

### 10.2 — Dashboard Layout (`(dashboard)/layout.tsx`)

ფაილი: `src/app/(dashboard)/layout.tsx`

```typescript
// Server Component — ბაზას პირდაპირ ეწვევა
export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  let hotelLogoSrc: string | undefined;
  if (session?.hotelId) {
    const pool = await getDB();
    const result = await pool
      .request()
      .input("id", session.hotelId)
      .query("SELECT logoUrl FROM hotels WHERE id = @id");
    hotelLogoSrc = result.recordset[0]?.logoUrl ?? undefined;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar hotelName={session?.hotelName} userFullName={session?.fullName} logoSrc={hotelLogoSrc} />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <TopHeader userFullName={session?.fullName} role="Admin" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

**ეს layout ყველა dashboard გვერდისთვის მუშაობს.** ერთხელ სერვერზე render-დება, სასტუმროს ლოგოს ბაზიდან ამოიღებს და Sidebar-ს გადაეცემა.

Layout-ის სტრუქტურა:
```
┌─────────────────────────────────────────┐
│  Sidebar (w-60, fixed)  │   Content     │
│  ─────────────────────  │  ───────────  │
│  Logo + Hotel Name      │  TopHeader    │
│  Navigation Items       │               │
│  Settings               │  {children}   │
│  Logout                 │               │
└─────────────────────────────────────────┘
```

---

### 10.3 — ნომრების გვერდი (`/rooms`)

ფაილი: `src/app/(dashboard)/rooms/page.tsx`

**Server Component — პირდაპირ ბაზიდან:**

```typescript
export default async function RoomsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  let rooms: RoomRow[] = [];
  if (session?.hotelId) {
    const pool = await getDB();
    const result = await pool.request()
      .input("hotel_id", session.hotelId)
      .query(`SELECT r.id, r.room_number, r.floor, ...`);
    rooms = result.recordset.map((r) => ({
      ...
      pricePerNight: Number(r.price_per_night).toFixed(2),
    }));
  }

  return <RoomsClient rooms={rooms} hotelName={session?.hotelName ?? "HMS"} />;
}
```

**ახსნა:** Server Component-ი ბაზიდან data-ს ამოიღებს, Client Component-ს (`RoomsClient`) გადაეცემა. `RoomsClient`-ი კი ამ data-ს ლამაზად აჩვენებს.

**ეს Pattern-ია:** Server კომპონენტი = data fetching, Client კომპონენტი = interactive UI.

---

### 10.4 — ჯავშნების გვერდი (`/reservations`)

ფაილი: `src/app/(dashboard)/reservations/page.tsx`

```typescript
"use client"; // ← Client Component!

export default function ReservationsPage() {
  const [tab, setTab] = useState<"checkin" | "checkout">("checkin");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reservations?tab=${tab}`);
    const data: BookingRow[] = await res.json();
    setRows(data);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchData();  // ← tab შეიცვალა → ახლიდან ჩამოიტვირთება
  }, [fetchData]);

  // ...
}
```

**ეს გვერდი Client Component-ია**, რადგან:
- `useState` — tab შეცვლა საჭიროა
- `useEffect` + `fetch` — data-ს API-დან ჩატვირთვა
- Interactive ცხრილი, checkbox-ები

**ნაკადი:**
```
გვერდი იტვირთება
    ↓
useEffect() სრულდება
    ↓
fetch("/api/reservations?tab=checkin")
    ↓
API route-ი სრულდება (session check + SQL query)
    ↓
JSON პასუხი ბრუნდება
    ↓
setRows(data) → React კომპონენტი ხელახლა render-დება
```

---

### 10.5 — ახალი ჯავშნის გვერდი (`/reservations/new`)

ფაილი: `src/app/(dashboard)/reservations/new/page.tsx`

დიდი ფორმა, სადაც:
- სტუმრის პირადი ინფორმაცია (სახელი, გვარი, ID, ასაკი...)
- მისამართი (ქვეყანა, ქალაქი, ZIP...)
- ჯავშნის დეტალები (check-in, check-out, ოთახის ტიპი...)
- დამატებითი სტუმრები

**room type-ების ჩამოტვირთვა:**
```typescript
useEffect(() => {
  fetch("/api/rooms")
    .then((r) => r.json())
    .then((data) => {
      const types = [...new Set(data.map((r: any) => r.room_type_name).filter(Boolean))];
      setRoomTypes(types as string[]);
    });
}, []);
```

**ფორმის გაგზავნა:**
```typescript
const res = await fetch("/api/bookings", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName, lastName, checkIn, checkOut, roomType, ...
  }),
});
```

---

### 10.6 — ჯავშნის რედაქტირება (`/reservations/[id]/edit`)

ფაილი: `src/app/(dashboard)/reservations/[id]/edit/page.tsx`

```typescript
const params = useParams();
const bookingId = params.id as string; // URL-დან id-ის ამოღება

useEffect(() => {
  // ჯავშნის მონაცემების ჩამოტვირთვა
  fetch(`/api/bookings/${bookingId}`)
    .then((r) => r.json())
    .then((data) => {
      setFirstName(data.firstName);
      // ყველა ველი ივსება
    });
}, [bookingId]);

// PUT მოთხოვნა შესანახად
const res = await fetch(`/api/bookings/${bookingId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ... }),
});
```

---

### 10.7 — Dashboard გვერდი (`/dashboard`)

ფაილი: `src/app/(dashboard)/dashboard/page.tsx`

**ამ გვერდზე მონაცემები სტატიკურია (hardcoded)** — ეს "mock data" ადგილი, რეალური სტატისტიკა ჯერ ბაზიდან არ მოდის. აქ `recharts` ბიბლიოთეკა გამოიყენება გრაფიკებისთვის:

- **PieChart** — ოთახის სტატუსების განაწილება (Occupied, Clean, Dirty...)
- **BarChart** — Occupancy Statistic თვეების მიხედვით

---

## 11. კომპონენტები

### 11.1 — LoginForm.tsx

`"use client"` — Client Component.

```typescript
async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();  // ← browser-ის default submit-ს ვაჩერებთ
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) { setError(data.error); return; }
  router.push("/dashboard");  // ← შესვლის შემდეგ dashboard-ზე
}
```

**`e.preventDefault()`** — ბრაუზერი ნაგულისხმევად form-ის submit-ზე გვერდს ხელახლა ტვირთავს. ჩვენ ამას ვაჩერებთ და `fetch`-ით ვაგზავნით.

---

### 11.2 — Sidebar.tsx

`"use client"` — Client Component (pathname-ის tracking-ი და collapse/expand სჭირდება).

```typescript
const pathname = usePathname();

// Active item-ის განსაზღვრა:
const isActive = pathname === href || pathname.startsWith(href + "/");
```

```typescript
async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  router.push("/login");
  router.refresh(); // ← Next.js cache-ის გასუფთავება
}
```

**`router.refresh()`** — Next.js-ს ეუბნება: "server component-ები ხელახლა render-ე" — ეს საჭიროა, რომ session-ი გაასუფთავოს.

---

### 11.3 — RoomsClient.tsx

ნომრების ცხრილი, ფილტრებით და საძიებო ველით. Data სერვერიდან მოდის (props-ად), interactive ნაწილი კლიენტზე სრულდება.

---

## 12. მთელი ნაკადი — ნაბიჯ ნაბიჯ

### სცენარი 1: პირველი ვიზიტი

```
1. ბრაუზერი: GET http://localhost:3000/
2. proxy.ts: Cookie? → არა → redirect /login
3. ბრაუზერი: GET /login
4. proxy.ts: PUBLIC_PATHS-ში? → დიახ → გაუშვა
5. Next.js: login/page.tsx → LoginForm render
6. ბრაუზერი: Login ფორმა გამოჩნდა
```

---

### სცენარი 2: შესვლა

```
1. მომხმარებელი: email + password შეიყვანა, "Sign In" დააჭირა
2. LoginForm.tsx handleSubmit():
   fetch("POST /api/auth/login", { email, password })
3. api/auth/login/route.ts:
   a. ბაზა: SELECT * FROM users WHERE email = @email
   b. bcrypt.compare(password, hash) → სწორია?
   c. createSession({ userId, email, hotelId, ... })
   d. Cookie.set("hms-session", jwt_token)
   e. return { success: true }
4. LoginForm.tsx:
   res.ok → router.push("/dashboard")
5. proxy.ts:
   Cookie "hms-session"? → verifySession() → session valid → გაუშვა
6. (dashboard)/layout.tsx:
   ბაზა: SELECT logoUrl FROM hotels WHERE id = @hotelId
   Sidebar + TopHeader + {children} render
7. /dashboard/page.tsx render
```

---

### სცენარი 3: ჯავშნების ნახვა

```
1. მომხმარებელი: Reservations ლინკს დააჭირა
2. Next.js: reservations/page.tsx load
3. "use client" → ბრაუზერში render
4. useEffect():
   fetch("GET /api/reservations?tab=checkin")
5. api/reservations/route.ts:
   a. Cookie → verifySession() → session.hotelId = 5
   b. SQL: SELECT ... FROM bookings b WHERE b.hotel_id = 5 AND ...
   c. JSON: [{ id, guestName, checkIn, ... }, ...]
6. reservations/page.tsx:
   setRows(data) → React re-render → ცხრილი გამოჩნდა
```

---

### სცენარი 4: ახალი ჯავშნის შექმნა

```
1. "+ New Booking" ღილაკი → router.push("/reservations/new")
2. reservations/new/page.tsx load
3. useEffect():
   fetch("GET /api/rooms") → room types dropdown-ისთვის
4. მომხმარებელი: ფორმა შეავსო, "Save" დააჭირა
5. handleSubmit():
   fetch("POST /api/bookings", { firstName, lastName, checkIn, ... })
6. api/bookings/route.ts:
   a. INSERT INTO guests → guestId = 42
   b. SELECT id FROM room_type WHERE name_eng = @roomType → roomTypeId
   c. SELECT TOP 1 id FROM booking_status ORDER BY sort_order → statusId
   d. INSERT INTO bookings → bookingId = 15
   e. INSERT INTO AdditionalGuests (loop)
   f. return { success: true, bookingId: 15 }
7. handleSubmit():
   router.push("/reservations")
```

---

### სცენარი 5: გამოსვლა

```
1. Sidebar Logout ღილაკი → handleLogout()
2. fetch("POST /api/auth/logout")
3. api/auth/logout/route.ts:
   cookies().delete("hms-session")
4. router.push("/login") + router.refresh()
5. proxy.ts:
   Cookie? → არა → redirect /login (დაცვის მეორე ფენა)
```

---

## 13. მონაცემთა ბაზის სქემა

კოდის ანალიზით ჩვენ შეგვიძლია შემდეგი ცხრილების გამოვლენა:

### `hotels`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| name | NVARCHAR | სასტუმროს სახელი |
| city | NVARCHAR | ქალაქი |
| logoUrl | NVARCHAR | ლოგოს URL |
| is_active | BIT | აქტიურია? |

### `users`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| full_name | NVARCHAR | სრული სახელი |
| email | NVARCHAR | ემეილი (unique) |
| password_hash | NVARCHAR | დაშიფრული პაროლი |
| hotel_id | INT | FK → hotels.id |
| role_id | INT | FK → user_role.id |
| is_active | BIT | ანგარიში აქტიურია? |
| last_login_at | DATETIME | ბოლო შესვლის დრო |

### `user_role`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| code | NVARCHAR | 'RECEPTIONIST', 'ADMIN' |
| is_active | BIT | — |

### `rooms`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| hotel_id | INT | FK → hotels.id |
| room_number | NVARCHAR | ნომრის ნომერი |
| floor | INT | სართული |
| room_type_id | INT | FK → room_type.id |
| price_per_night | DECIMAL | ღამის ფასი |
| is_available | BIT | თავისუფალია? |
| description | NVARCHAR | აღწერა |

### `room_type`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| name_eng | NVARCHAR | 'Single', 'Double', 'Suite' |
| is_active | BIT | — |

### `guests`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| hotel_id | INT | FK → hotels.id |
| full_name | NVARCHAR | სრული სახელი |
| first_name | NVARCHAR | სახელი |
| last_name | NVARCHAR | გვარი |
| gender | NVARCHAR | სქესი |
| age | INT | ასაკი |
| id_type | NVARCHAR | პასპორტი / ID |
| id_number | NVARCHAR | დოკუმენტის ნომერი |
| phone | NVARCHAR | ტელეფონი |
| email | NVARCHAR | ემეილი |
| city / state / zip_code | NVARCHAR | მისამართი |
| notes | NVARCHAR | შენიშვნა |

### `bookings`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| hotel_id | INT | FK → hotels.id |
| guest_id | INT | FK → guests.id |
| status_id | INT | FK → booking_status.id |
| created_by | INT | FK → users.id |
| check_in | DATE | ჩამოსვლის თარიღი |
| check_out | DATE | წასვლის თარიღი |
| room_id | INT | FK → rooms.id (nullable) |
| guests_count | TINYINT | მოზარდები |
| kids_count | TINYINT | ბავშვები |
| rooms_count | TINYINT | ოთახების რაოდენობა |
| total_price | DECIMAL | სრული ფასი |
| arrival_time | NVARCHAR | ჩამოსვლის დრო |
| requested_room_type_id | INT | FK → room_type.id |
| requested_payment_method | NVARCHAR | გადახდის მეთოდი |
| special_request | NVARCHAR | სპეციალური მოთხოვნა |
| created_at | DATETIME | შექმნის დრო |

### `booking_status`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| name_eng | NVARCHAR | 'Pending', 'Confirmed'... |
| color_hex | NVARCHAR | '#4ade80' — სტატუსის ფერი |
| is_active | BIT | — |
| sort_order | INT | Default სტატუსის განსასაზღვრად |

### `payments`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| booking_id | INT | FK → bookings.id |
| amount | DECIMAL | გადახდილი თანხა |

### `AdditionalGuests`
| სვეტი | ტიპი | აღწერა |
|---|---|---|
| id | INT | Primary Key |
| booking_id | INT | FK → bookings.id |
| first_name | NVARCHAR | სახელი |
| last_name | NVARCHAR | გვარი |
| gender | NVARCHAR | სქესი |
| age | INT | ასაკი |

---

## დასკვნა

### მთავარი პრინციპები შეჯამებულად:

| კონცეფცია | HMS-ში გამოყენება |
|---|---|
| **Server Components** | `rooms/page.tsx` — ბაზიდან data, HTML-ად ბრაუზერს |
| **Client Components** | `reservations/page.tsx` — interactive tab, search |
| **API Routes** | `api/auth/login` — სერვერული ლოგიკა |
| **Middleware** | `proxy.ts` — ყველა request-ს ამოწმებს |
| **JWT Cookie** | `hms-session` — სეასიის შენახვა |
| **Connection Pool** | `db.ts` — ბაზასთან ეფექტური კავშირი |
| **bcrypt** | პაროლის hash-ი ბაზაში |
| **Parameterized Query** | SQL Injection-ისგან დაცვა |
| **Ownership Check** | ჯავშნები მხოლოდ საკუთარი სასტუმრო |

### პროგრამის გაშვება:

```bash
# 1. .env ფაილი შექმენი:
DATABASE_URL=sqlserver://localhost:1433;database=HotelDB;user=sa;password=YourPassword;trustServerCertificate=true
JWT_SECRET=your-very-long-random-secret-key

# 2. დეპენდენსები:
npm install

# 3. Development სერვერი:
npm run dev

# 4. ბრაუზერი:
http://localhost:3000  →  /login
```

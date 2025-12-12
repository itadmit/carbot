# CarBot - מערכת לניהול חלקי חילוף

מערכת SaaS חכמה שמחברת בין מוסכים לספקי חלקי חילוף באמצעות צ'אטבוט, דשבורד ניהול ונוטיפיקציות WhatsApp.

## 🚀 תכונות עיקריות

### למוסכים (Garages)

- 🤖 **צ'אטבוט חכם** - פתיחת בקשות לחלקים בקלות
- 🔍 **חיפוש רכב אוטומטי** - שליפת נתונים לפי מספר רישוי
- 📋 **ניהול בקשות** - צפייה בכל הבקשות וההצעות
- 📲 **התראות WhatsApp** - עדכונים על הצעות חדשות

### לספקים (Suppliers)

- 🎯 **התאמה חכמה** - קבלת בקשות רלוונטיות בלבד
- 💰 **שליחת הצעות מחיר** - ממשק קל לשליחת הצעות
- ⚙️ **הגדרת העדפות** - בחירת יצרנים, דגמים ואזורים
- 📲 **התראות WhatsApp** - עדכונים על בקשות חדשות

## 🛠️ טכנולוגיות

- **Next.js 15** - App Router + Server Components
- **TypeScript** - קוד מוקלד ובטוח
- **Prisma ORM** - ניהול מסד נתונים
- **SQLite** - מסד נתונים (ניתן להחליף ל-PostgreSQL/MySQL)
- **NextAuth.js** - אימות משתמשים
- **Tailwind CSS** - עיצוב מודרני עם תמיכה ב-RTL
- **RappelSend API** - שליחת הודעות WhatsApp
- **Lucide React** - אייקונים

## 📦 התקנה

### 1. שכפול הפרויקט

```bash
git clone https://github.com/itadmit/carbot.git
cd carbotnext
```

### 2. התקנת חבילות

```bash
npm install
```

### 3. הגדרת משתני סביבה

העתק את `.env.example` ל-`.env` וערוך:

```env
# Database
DATABASE_URL="file:./prisma/carbot.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# RappelSend WhatsApp API
RAPPEL_CLIENT_ID="your-client-id"
RAPPEL_API_KEY="your-api-key"
```

### 4. הגדרת מסד הנתונים

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

### 5. הרצת השרת

```bash
npm run dev
```

האתר יהיה זמין ב: http://localhost:3000

## 📚 מבנה הפרויקט

```
carbotnext/
├── app/
│   ├── (auth)/
│   │   ├── login/          # מסך כניסה
│   │   └── register/       # מסך הרשמה
│   ├── api/
│   │   ├── auth/           # NextAuth + Register
│   │   ├── chat/           # Chatbot API
│   │   ├── vehicle/        # Vehicle lookup
│   │   ├── garage/         # Garage APIs
│   │   └── supplier/       # Supplier APIs
│   ├── garage/
│   │   ├── chat/           # צ'אטבוט למוסכים
│   │   └── requests/       # ניהול בקשות
│   └── supplier/
│       ├── requests/       # בקשות פתוחות
│       ├── offers/         # הצעות ששלחתי
│       └── settings/       # העדפות
├── components/
│   ├── garage/             # קומפוננטות למוסכים
│   └── supplier/           # קומפוננטות לספקים
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   ├── whatsapp.ts         # RappelSend integration
│   ├── notifications.ts    # Notification service
│   ├── chatbot.ts          # Chatbot logic
│   ├── matching.ts         # Supplier matching
│   └── vehicle.ts          # Vehicle lookup
├── prisma/
│   └── schema.prisma       # Database schema
└── types/                  # TypeScript types
```

## 🔄 תהליך עבודה

### מוסך פותח בקשה:

1. מתחבר למערכת
2. נכנס לצ'אטבוט
3. מזין מספר רכב
4. מאשר פרטי רכב
5. מוסיף רשימת חלקים
6. מאשר - הבקשה נשלחת

### מערכת מתאימה ספקים:

1. מחפשת ספקים לפי יצרן הרכב
2. מסננת לפי אזור גיאוגרפי
3. שולחת WhatsApp לספקים מתאימים

### ספק שולח הצעה:

1. מקבל התראת WhatsApp
2. נכנס לדשבורד
3. צופה בפרטי הבקשה
4. מסמן חלקים זמינים + מחירים
5. שולח הצעה

### מוסך מקבל הצעות:

1. מקבל התראת WhatsApp
2. צופה בכל ההצעות
3. משווה מחירים
4. יוצר קשר עם ספק

## 🔐 אבטחה

- **Middleware** - הגנה על routes לפי תפקיד
- **NextAuth** - אימות מאובטח
- **Bcrypt** - הצפנת סיסמאות
- **Prisma** - הגנה מפני SQL Injection
- **Role-based access** - הפרדת הרשאות

## 📲 אינטגרציית WhatsApp

המערכת משתמשת ב-RappelSend API לשליחת הודעות WhatsApp:

```typescript
// Example usage
await sendWhatsApp(
  '972542284283',  // Phone in international format
  'הודעה לדוגמה'
)
```

נשלחות הודעות ב-3 נקודות:

1. **בקשה נוצרה** → למוסך
2. **התאמה לספקים** → לספקים רלוונטיים
3. **הצעה נשלחה** → למוסך

## 🚧 פיתוח עתידי

- [ ] אינטגרציה אמיתית עם gov.il API
- [ ] דשבורד Admin מלא
- [ ] מערכת דירוג לספקים
- [ ] היסטוריית עסקאות
- [ ] ניתוח ודוחות
- [ ] אפליקציית מובייל
- [ ] תמיכה בשפות נוספות

## 📝 נתונים לדוגמה (Mock)

המערכת כוללת מספרי רכב לדוגמה:

- `12345678` - Mazda 3 2018
- `87654321` - Toyota Corolla 2020
- `11111111` - Mitsubishi Lancer 2017
- `22222222` - Honda Civic 2019
- `33333333` - Hyundai i30 2021

## 👥 תפקידים במערכת

### GARAGE (מוסך)

- גישה ל-`/garage/*`
- פתיחת בקשות
- צפייה בהצעות

### SUPPLIER (ספק)

- גישה ל-`/supplier/*`
- צפייה בבקשות מתאימות
- שליחת הצעות מחיר
- הגדרת העדפות

### ADMIN (מנהל)

- גישה ל-`/admin/*` (להכנה בעתיד)
- ניהול משתמשים
- צפייה בכל הפעילות

## 🐛 בעיות נפוצות

### בעיות התחברות למסד נתונים

```bash
# בדוק את DATABASE_URL ב-.env
# הרץ migrations
npx prisma migrate dev
```

### שגיאות Prisma Client

```bash
# רענן את Prisma Client
npx prisma generate
```

### שגיאות NextAuth

```bash
# ודא ש-NEXTAUTH_SECRET מוגדר
# ודא ש-NEXTAUTH_URL נכון
```

## 📞 תמיכה

לשאלות ותמיכה, פנה ל:

- Email: support@carbot.com
- WhatsApp: 050-1234567

---

Built with ❤️ using Next.js and TypeScript


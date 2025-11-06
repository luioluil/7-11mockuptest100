# 🏪 7-11 Mockup Landing v99.9  
**Prototype Website — Frontend + Team Showcase + Product Filter Demo**

> 🔧 โปรเจกต์นี้เป็นต้นแบบเว็บไซต์ (Mockup) สำหรับการเรียนและนำเสนอแนวคิดระบบกรองสินค้า / ตะกร้า / เช็คเอาต์ ของ 7-Eleven โดยใช้ Bootstrap 5 และโครงสร้าง Front-end พร้อมต่อยอดเชื่อม API ได้จริงในอนาคต

---

## 🚀 Overview

เว็บไซต์นี้แบ่งออกเป็น 2 ส่วนหลัก

1. **Landing Page (7-11mockuptest-99.9-)**  
   - หน้าหลักแสดง Feature / Pricing / Team / Contact  
   - ใช้ดีไซน์โทนสีตามเอกลักษณ์ 7-Eleven (`#1BA548` เขียว และ `#F36E21` ส้ม)
   - Responsive เต็มรูปแบบ (มือถือ-แท็บเล็ต-พีซี)

2. **Demo Page (../demo/index.html)**  
   - จำลองระบบฟิลเตอร์สินค้า / เพิ่มตะกร้า / Checkout  
   - ใช้ข้อมูลจำลองสำหรับสาธิต flow ของร้านค้าออนไลน์

---

## 🧩 Features

| หมวด | รายละเอียด |
|------|-------------|
| 🎨 **UI/UX Design** | ใช้ Bootstrap 5 + CSS Custom Variables ปรับสีและฟอนต์ให้ใกล้เคียงแบรนด์ 7-Eleven |
| ⚙️ **Smart Filter System** | ฟิลเตอร์หมวด / โปร / แท็ก / ค้นหาแบบเรียลไทม์ |
| 🛒 **Product Cart Simulation** | เพิ่มสินค้า / ลบ / คิดราคา net ต่อหน่วย |
| 📦 **Checkout Flow** | แสดงข้อมูลสรุป / กรอกที่อยู่ / ยืนยันการสั่งซื้อ |
| 👥 **Team Showcase** | แสดงรายชื่อทีมพร้อม modal popup รายละเอียดแต่ละคน |
| 🧠 **Prototype Ready** | พร้อมเชื่อม API หรือ Back-end ในอนาคต |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)  
- **Framework:** [Bootstrap 5.3.3](https://getbootstrap.com/)  
- **Icons:** [Bootstrap Icons](https://icons.getbootstrap.com/)  
- **Font:** Poppins + Noto Sans Thai  
- **Tools:** Visual Studio Code, GitHub Pages, Chrome DevTools  

---

## 🗂️ Project Structure

```bash
7-11mockuptest-99.9-/
│
├── index.html                # หน้า Landing หลัก
├── demo/
│   ├── index.html            # หน้า Demo จำลองระบบกรองสินค้า
│   └── assets/
│       ├── css/              # สไตล์เสริม (เช่น custom.css)
│       ├── js/               # script สำหรับฟังก์ชัน filter/cart
│       └── images/
│           └── team/         # ภาพสมาชิกทีม (.jpg/.png)
│
├── assets/
│   └── images/
│       └── logo-7eleven.png  # โลโก้ 7-Eleven ที่ใช้ใน navbar
│
└── README.md

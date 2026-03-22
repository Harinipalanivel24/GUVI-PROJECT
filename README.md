# Register → Login → Profile Web Application

A full-stack PHP web application with user registration, login, and profile management.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML + Bootstrap 5** | Frontend UI (responsive forms) |
| **CSS** | Custom styling |
| **JavaScript + jQuery** | AJAX calls to backend (no form submissions) |
| **PHP** | Backend API |
| **MySQL** | Stores registration data (prepared statements only) |
| **MongoDB** | Stores user profile details |
| **Redis** | Stores session tokens (backend) |
| **localStorage** | Stores session token (browser side) |

## Flow

```
Register → Login → Profile
```

1. **Register** (`register.html`) — User fills in Name, Email, Password → stored in **MySQL**
2. **Login** (`login.html`) — User authenticates → token stored in **Redis** (backend) + **localStorage** (browser)
3. **Profile** (`profile.html`) — User views/updates profile details (Age, DOB, Contact, etc.) → stored in **MongoDB**

---

## Prerequisites

Before running this project, you need the following installed and running:

### 1. XAMPP (PHP + MySQL)

1. Download and install from [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)
2. Open **XAMPP Control Panel** → Click **Start** next to **Apache** and **MySQL**
3. Add `C:\xampp\php` to your system **PATH**:
   - Press `Win + R` → type `sysdm.cpl` → **Advanced** tab → **Environment Variables**
   - Under **System variables**, find `Path` → **Edit** → **New** → add `C:\xampp\php`
   - Click **OK** on all dialogs, then open a **new** terminal

### 2. Create MySQL Database

1. Make sure Apache and MySQL are running in XAMPP
2. Open browser → go to **http://localhost/phpmyadmin**
3. Click the **SQL** tab at the top
4. Paste this and click **Go**:

```sql
CREATE DATABASE IF NOT EXISTS user_auth_db;

USE user_auth_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. MongoDB

1. Download and install MongoDB Community from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. During install → check **"Install MongoDB as a Service"**

**Enable PHP MongoDB Extension:**
1. Download matching `php_mongodb.dll` from [https://pecl.php.net/package/mongodb](https://pecl.php.net/package/mongodb)
2. Copy `php_mongodb.dll` into `C:\xampp\php\ext\`
3. Edit `C:\xampp\php\php.ini` → add: `extension=mongodb`

### 4. Redis

#### Option A: Memurai (recommended for Windows)
1. Download from [https://www.memurai.com/get-memurai](https://www.memurai.com/get-memurai)
2. Install → it auto-starts as a Windows service on port 6379

**Enable PHP Redis Extension:**
1. Download matching `php_redis.dll` from [https://pecl.php.net/package/redis](https://pecl.php.net/package/redis)
2. Copy `php_redis.dll` into `C:\xampp\php\ext\`
3. Edit `C:\xampp\php\php.ini` → add: `extension=redis`

### 5. Composer (PHP Package Manager)

1. Download from [https://getcomposer.org/download/](https://getcomposer.org/download/) and run Windows installer

---

## How to Run

```powershell
# 1. Clone the repo
git clone <your-repo-url>
cd <repo-folder>

# 2. Install PHP dependencies (MongoDB library)
composer install

# 3. Make sure these services are running:
#    - MySQL (XAMPP Control Panel → Start MySQL)
#    - MongoDB (runs as service automatically)
#    - Redis / Memurai (runs as service automatically)

# 4. Start the PHP development server
php -S localhost:8000

# 5. Open in browser
# http://localhost:8000/register.html
```

## Folder Structure

```
├── assets/
├── css/
│   └── style.css
├── js/
│   ├── login.js
│   ├── profile.js
│   └── register.js
├── php/
│   ├── login.php
│   ├── profile.php
│   └── register.php
├── index.html
├── login.html
├── profile.html
├── register.html
```

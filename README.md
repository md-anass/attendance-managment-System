# Attendance & Roster Management System (AMS)

A Next.js, TypeScript, TailwindCSS, and Supabase powered system to manage employees, shifts scheduling, approved leaves, visual dashboard stats, and custom CSV spreadsheets or PDF exports.

## Core Feature Modules

### 1. Dashboard & Home
* Live stats cards displaying total employee count, attendance percentages, present/absent rates, and leave summaries.
* Comparative Recharts graphs analyzing daily presence segments, department rates, and work hour trends.

### 2. Employee Directory
* View details, create new entries, edit fields, and filter lists.
* Profile avatars automatically formatted from initials.

### 3. Shifts & Weekly Schedules
* Define weekly shift timings (regular day, night, off).
* Drag-and-drop assignments, interactive calendars, and automatic grace minutes calculations.

### 4. Leaves & Holidays Audit
* Set approved durations, count working days, check balances, and type custom comments.

### 5. Reports Hub
* **Daily Attendance**: Timestamps, shift names, overtime hours, and status.
* **Monthly Summary**: Table grids summarizing month-to-date presence counts.
* **Employee Audit**: Detailed profile view, hours histories, and real database logs calendar.
* **Department Performance**: Compare staff metrics with side-by-side bar charts.

## Technologies Used
* **Frontend**: Next.js 16 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS v4, Lucide Icons, Shadcn UI
* **Charts**: Recharts
* **Backend**: Supabase Database

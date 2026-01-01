# 🛒 Domácí úkol – Seznamy nákupů

**Autor:** Michal Bezpalec  
**Technologie:**  
- Frontend: React + Vite  
- Backend: jednoduchá API logika (Node.js / Express) ve složce `/api`

---

## 📌 Popis projektu

Projekt představuje jednoduchou aplikaci pro správu **nákupních seznamů**.  
Uživatel může vytvářet, upravovat, mazat a archivovat seznamy, pracovat s položkami a spravovat členy seznamu.

Aplikace je rozdělena na **frontendovou část** (React) a **jednoduchou backendovou logiku**, která běží pouze lokálně a slouží pro účely cvičení (nejde o produkční backend).

---

## 📁 Struktura projektu

### `/api/`

Obsahuje implementaci základní backendové logiky využívané v rámci úkolu:

- mock endpointy pro práci se seznamy nákupů,
- vytváření, úprava a mazání seznamů,
- archivace seznamů,
- práce s položkami,
- správa členů seznamu,
- validace vstupních dat,
- middleware (autentizace, role, validace).

Celá API logika běží **pouze lokálně v rámci vývojového serveru** a slouží k simulaci backendu pro frontendovou aplikaci.

Součástí projektu jsou také **unit testy** implementované pomocí Jest a Supertest.

---

### `/src/`

Hlavní část frontendové aplikace postavené v Reactu:

- React komponenty,
- jednotlivé stránky aplikace (routes),
- stylování (`App.css`),
- persistentní stav (`usePersistentState`),
- UI logika (modály, seznamy, filtry).

Struktura je rozdělena do přehledných složek:

- `components/` – znovupoužitelné UI komponenty  
- `routes/` – jednotlivé stránky aplikace (`ListsPage`, `ListDetailPage`)  
- `assets/` – statické soubory a grafika  
- `validators/` – validace dat  
- `mw/` – middleware nad API (role, validace)

---

## ▶️ Spuštění aplikace

### Build a spuštění projektu
npm run dev

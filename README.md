###🛒 Domácí úkol FE #2 – Seznamy nákupů

Autor: Michal Bezpalec
Technologie: React + Vite (frontend) + jednoduchá API logika ve složce /api

📁 Struktura projektu

/api/

Obsahuje implementaci základní backendové logiky využívané v rámci úkolu:
	•	mock endpointy pro práci se seznamy,
	•	mazání položek,
	•	archivace,
	•	úprava názvu,
	•	správa členů,
	•	validace.

Celá logika běží pouze lokálně v rámci vývojového serveru (není to skutečný backend).

⸻

/src/

Hlavní část frontend aplikace:
	•	React komponenty,
	•	stránky (routes),
	•	stylování (App.css),
	•	persistentní stav (usePersistentState),
	•	UI logika (modály, seznamy, filtry).

Struktura je rozdělená do složek:
	•	components/ – znovupoužitelné UI bloky
	•	routes/ – jednotlivé stránky (ListsPage, ListDetailPage)
	•	assets/ – případná grafika
	•	validators/ – kontrola dat
	•	mw/ – middlewares nad API (role, validace)

 ### Spuštění buildu
 npx serve -s . -l 5173
 
 ### Aplikace se spustí na:
👉 http://localhost:5173

# 📐 Pravoúhlé Promítání CAD — Výukový Software pro Školy

Interaktivní webová aplikace v Reactu, TypeScriptu a Three.js určená pro výuku **pravoúhlého promítání**  z 3D CAD modelů vytvořených v programu **Fusion 360**.

---

## ✨ Hlavní Funkcionality

- 🏫 **Třídní Režim s Odhalováním Průmětů**:
  - Pohledy (Nárys $V_1$, Půdorys $V_2$, Bokorys $V_3$) jsou výchozím stavem skryté pod výukovou kartou.
  - Tlačítka pro postupné odhalování průmětů (`👁️ Odkrýt Nárys`, `👁️ Odkrýt Půdorys`, `👁️ Odkrýt Bokorys`, `👁️ Odkrýt všechny 3 průměty`) pro kontrolu ve třídě.
  - Všechny 4 pohledy jsou zmenšeny tak, aby se pohodlně vešly na **jednu interaktivní tabuli / projektor bez scrollování**.
- 🧊 **5 Vestavěných Ukázkových CAD Těles**:
  1. *L-Profil (Stupňovitý blok)* `[LEHKÁ]`
  2. *Klínový blok s drážkou* `[LEHKÁ]`
  3. *U-Profil s válcovým otvorem* `[STŘEDNÍ]` — s čárkovanými skrytými hranami
  4. *Stupňovité těleso se zkosením* `[STŘEDNÍ]`
  5. *CAD T-drážka z Fusion 360* `[TĚŽKÁ]`
- 📁 **Učitelská Databáze & Nahrávání OBJ Modelů**:
  - Nahrávání 3D modelů ve formátu `.obj` z Fusion 360.
  - Ukládání těles a metadat do lokální databáze (IndexedDB).
  - Vizuální 3D miniaturní náhledy těles přímo v katalogu.

---

## 🌐 Jak Publikovat na GitHub Pages (Zdarmo)

1. Vytvořte nový repozitář na [GitHub.com](https://github.com).
2. Nahrajte všechny soubory projektu.
3. V nastavení repozitáře na GitHubu v záložce **Settings -> Pages**:
   - V sekci **Build and deployment -> Source** vyberte **Deploy from a branch**.
   - Nastavte větve **Branch**: `main` a složku `/ (root)`.
   - Klikněte na **Save**.
4. Během minuty bude vaše výuková aplikace přístupná odkudkoliv na adrese `https://<vase-uzivatelske-jmeno>.github.io/<nazev-repozitare>/`, tj. https://Sarka636.github.io/OrthoProjections/

# SODOM Flip Clock (`custom:sodom-flip-clock`)

A lightweight retro split-flap clock Lovelace card for Home Assistant with smooth flip animation, GPU-accelerated blinking colon, server timezone synchronization, and multi-language support (English and Polish).

Built specifically to solve common issues on wall-mounted dashboard tablets (including older Android 7.0 / 8.0 devices with legacy WebViews).

![SODOM Flip Clock Preview](images/preview.jpg)

---

## Key Highlights

- **Multi-language Auto-detection:** Automatically displays the day of week and date in Polish if Home Assistant is set to Polish, or in English for any other language. Can also be manually forced in YAML (`language: en` or `language: pl`).
- **Full Compatibility with Legacy Tablets:** Does not use CSS Container Queries (`cqw` / `@container`) that collapse cards to 0 px on WebView < 105 (e.g. Android 7.0 / Nougat). Responsiveness is handled smoothly via `ResizeObserver`.
- **True Timezone Sync:** Reads `hass.config.time_zone` directly from your Home Assistant server, preventing wrong time displays on tablets with desynchronized local clocks or missing battery RTCs.
- **Ultra-low CPU Overhead (GPU-Accelerated):** The blinking colon runs entirely on GPU keyframes (opacity: 1 <-> 0.15) without JavaScript DOM reflows. The 3D flip animation triggers only for the specific digit that changes in a given minute, minimizing processor load on wall tablets.

---

## Configuration

![Card Configuration Editor](images/editor.png)

Add a **Manual Card** to your dashboard and configure it using YAML:

```yaml
type: custom:sodom-flip-clock
language: auto
digit_color: '#FFA000'
digit_glow: 'rgba(255, 160, 0, 0.35)'
animation: true
blink_colon: true
show_date: true
uppercase_day: true
```

### Options Explained

| Parameter | Type | Default | Description |
|---|---|---|---|
| `type` | string | **required** | `custom:sodom-flip-clock` |
| `language` | string | `auto` | Language for date and day name. Options: `auto`, `en`, `pl`. In `auto` mode, detects HA Polish locale or falls back to English. |
| `digit_color` | string (HEX/RGB) | `#FFA000` | Primary color of the digits and colon dots. Vintage amber, neon green, bright white, etc. |
| `digit_glow` | string (CSS) | `rgba(255, 160, 0, 0.35)` | Subtle neon glow around numbers and dots. Set to `none` or `transparent` for matte plastic flaps. |
| `animation` | boolean | `true` | Enables 3D split-flap rotation when digits update. |
| `blink_colon` | boolean | `true` | 1 Hz blinking colon between hours and minutes. |
| `show_date` | boolean | `true` | Shows weekday name and formatted full date below the clock. |
| `uppercase_day` | boolean | `true` | Capitalizes the weekday name (e.g. `TUESDAY` / `WTOREK`). |
| `time_zone` | string | `''` (auto) | Custom IANA timezone (e.g. `Europe/Warsaw`, `America/New_York`). Defaults to Home Assistant server timezone. |

---

## Styling Presets

### 1. Vintage Amber Classic (Default)
Warm amber glow matching classic terminal screens and station boards:
```yaml
type: custom:sodom-flip-clock
digit_color: '#FFA000'
digit_glow: 'rgba(255, 160, 0, 0.35)'
```

### 2. Modern Clean White
Neutral, crisp white numbers on dark smoked glass:
```yaml
type: custom:sodom-flip-clock
digit_color: '#FFFFFF'
digit_glow: 'rgba(255, 255, 255, 0.2)'
```

### 3. Cyber Matrix Green
High-contrast neon green look:
```yaml
type: custom:sodom-flip-clock
digit_color: '#00FF66'
digit_glow: 'rgba(0, 255, 102, 0.45)'
```

### 4. Minimalist Matte (No Glow, Time Only)
Clean matte digits without glow and without date box:
```yaml
type: custom:sodom-flip-clock
digit_color: '#E0E0E0'
digit_glow: 'none'
show_date: false
```

---

## Installation Guide (Step-by-Step for Everyone)

You do not need to be a developer to install and use this card. Choose the method that suits you best:

### Method 1: Beginner-Friendly Manual Installation

#### Step 1: Download the card file
Download the single JavaScript file `sodom-flip-clock.js` from the latest release on GitHub (or click on the file in this repository and click **Download raw file**).

#### Step 2: Place the file in your Home Assistant `www` folder
1. Open your Home Assistant configuration directory (using Samba share, File Editor add-on, or Studio Code Server add-on).
2. Look for a folder named `www` inside `/config/` (or the main Home Assistant folder).
   *Note: If the `www` folder does not exist yet, simply create a new folder named `www`.*
3. Copy `sodom-flip-clock.js` into this `www` folder.
   The resulting file path will be `/config/www/sodom-flip-clock.js`.

> **Helpful Tip:** In Home Assistant, any file placed in `/config/www/` is automatically served to your web browser under the URL path `/local/`. So `/config/www/sodom-flip-clock.js` becomes `/local/sodom-flip-clock.js`.

#### Step 3: Register the card in Lovelace Resources
1. In Home Assistant, go to **Settings -> Dashboards**.
2. Click the **three vertical dots** in the top right corner and select **Resources**.
3. Click the **Add Resource** button in the bottom right corner.
4. Fill in the fields:
   - **URL:** `/local/sodom-flip-clock.js?v=1.1.0`
   - **Resource type:** `JavaScript Module`
5. Click **Create** (or **Update**).

#### Step 4: Refresh your browser cache
Lovelace caches JavaScript files aggressively. Do a hard refresh in your browser:
- On Windows / Linux: press `Ctrl + F5` or `Ctrl + Shift + R`.
- On Mac: press `Cmd + Shift + R`.
- On mobile or Fully Kiosk: reload the app or clear web cache in settings.

#### Step 5: Add the card to your Dashboard
1. Go to the dashboard where you want the clock to appear.
2. Click the pencil icon in the top right corner to edit the dashboard.
3. Click **Add Card** (at the bottom or in your desired column).
4. Scroll all the way down and select **Manual** (the card with code brackets `{ }`).
5. Replace the template code with:
   ```yaml
   type: custom:sodom-flip-clock
   ```
6. You will immediately see the clock preview on the right. Click **Save** and then **Done**.

---

### Method 2: AI Agent Installation (Prompt & Go)
If you use an AI coding assistant connected to your Home Assistant (e.g. Antigravity, Claude Code, Cursor, or an MCP agent), you do not need to do anything manually. Simply paste this instruction into your chat with the agent:

> *"Please download `sodom-flip-clock.js` from https://github.com/hookmt/sodom-flip-clock into my Home Assistant `/config/www/` directory, register `/local/sodom-flip-clock.js?v=1.1.0` as a JavaScript module in Lovelace dashboard resources, and add a manual card to my dashboard with amber retro style."*

---

### Method 3: HACS Installation (Custom Repository)
1. In Home Assistant, open **HACS**.
2. Click the three dots in the top right corner and choose **Custom repositories**.
3. Enter `hookmt/sodom-flip-clock` in the Repository field and select category **Dashboard** (or **Lovelace**).
4. Click **Add**, find **SODOM Flip Clock** in the list, and click **Download**.
5. Reload your dashboard when prompted by HACS.

---

## Instrukcja krok po kroku po polsku (instalacja łopatologiczna)

Nie musisz znać się na programowaniu ani edycji kodu, żeby uruchomić ten zegar na swoim tablecie lub komputerze. Poniżej znajduje się najprostsza możliwa ścieżka:

### Krok 1: Pobierz plik zegara
Pobierz plik `sodom-flip-clock.js` z tego repozytorium (kliknij na plik, a następnie na ikonę pobierania `Download raw file`).

### Krok 2: Wgraj plik do Home Assistanta
1. Połącz się z plikami swojego Home Assistanta (np. przez udział sieciowy Samba, dodatek **File Editor** lub **Studio Code Server**).
2. Wejdź do głównego katalogu `/config/`.
3. Sprawdź, czy masz w nim folder o nazwie `www`.
   *Ważne: Jeśli folder `www` jeszcze u Ciebie nie istnieje, po prostu utwórz nowy folder i nazwij go `www`.*
4. Wklej pobrany plik `sodom-flip-clock.js` do środka folderu `www`.
   Pełna ścieżka pliku to: `/config/www/sodom-flip-clock.js`.

> **Dlaczego to działa:** Home Assistant traktuje zawartość folderu `/config/www/` jako publiczne pliki lokalne i udostępnia je przeglądarce pod adresem zaczynającym się od `/local/`. Dlatego ścieżka `/config/www/sodom-flip-clock.js` na dysku odpowiada adresowi `/local/sodom-flip-clock.js` w przeglądarce.

### Krok 3: Dodaj zasób w Home Assistancie
1. W menu bocznym HA wejdź w: **Ustawienia -> Pulpity nawigacyjne**.
2. W prawym górnym rogu kliknij **menu z trzema kropkami** i wybierz **Zasoby**.
3. W prawym dolnym rogu kliknij niebieski przycisk **Dodaj zasób**.
4. Wypełnij dwa pola:
   - **Adres URL:** `/local/sodom-flip-clock.js?v=1.1.0`
   - **Typ zasobu:** `Moduł JavaScript`
5. Kliknij **Utwórz**.

### Krok 4: Wyczyść pamięć podręczną (bardzo ważne!)
Przeglądarki internetowe mocno zapamiętują pliki JavaScript. Aby przeglądarka pobrała nowo wgrany plik:
- Na komputerze naciśnij na pulpicie HA kombinację klawiszy: **`Ctrl + F5`** (lub `Ctrl + Shift + R`).
- Na telefonie lub tablecie (np. w aplikacji Fully Kiosk): odśwież stronę lub wyczyść pamięć podręczną w menu aplikacji.

### Krok 5: Wstaw kafelek na pulpit
1. Wejdź na pulpit nawigacyjny, na którym chcesz umieścić zegar.
2. W prawym górnym rogu kliknij ikonę ołówka (**Edytuj pulpit**).
3. Kliknij **Dodaj kartę**.
4. Przewiń listę kart na sam dół i wybierz **Ręczna** (Manual Card z ikoną nawiasów klamrowych `{ }`).
5. Skasuj przykładowy tekst i wklej:
   ```yaml
   type: custom:sodom-flip-clock
   ```
6. Po prawej stronie w oknie podglądu natychmiast pojawi się działający zegar klapkowy. Kliknij **Zapisz**, a potem **Gotowe** w prawym górnym rogu.

---

### Jak dostosować wygląd kafelka:
Jeśli chcesz zmienić kolor cyfr lub język, kliknij na kafelku trzy kropki -> **Edytuj** i dopisz w edytorze YAML odpowiednie opcje:

- **Język angielski:**
  ```yaml
  type: custom:sodom-flip-clock
  language: en
  ```
- **Język polski (domyślny w polskim HA):**
  ```yaml
  type: custom:sodom-flip-clock
  language: pl
  ```
- **Cyfry białe zamiast bursztynowych:**
  ```yaml
  type: custom:sodom-flip-clock
  digit_color: '#FFFFFF'
  digit_glow: 'rgba(255, 255, 255, 0.2)'
  ```
- **Sam zegar bez dolnego paska z datą:**
  ```yaml
  type: custom:sodom-flip-clock
  show_date: false
  ```
- **Klasyczny matowy plastik (bez neonowej poświaty):**
  ```yaml
  type: custom:sodom-flip-clock
  digit_glow: 'none'
  ```

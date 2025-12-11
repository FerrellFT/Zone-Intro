# Namtara Zone Title Popup

A FromSoft-style zone name popup for Namtara / Time Runs Out games in Foundry VTT.

- Shows a centered title overlay for the current scene.
- Optional subtitle (using `--` separator).
- Plays a short sound effect.
- Duration and audio are configurable.
- Triggered manually via chat command (`/zone`) or API.

## Installation (GitHub)

1. Add this repo as a module in Foundry/Forge using the manifest URL:

   `https://raw.githubusercontent.com/FerrellFT/Namtara-Zone-Title/main/module.json`

2. Install and enable **Namtara Zone Title Popup** in your world.

## Usage

### Scene Configuration

Open **Scene Config → Basic tab**:

- **Namtara Zone Title**: optional custom title just for the popup.
  - If left blank, the Scene's name is used.

### Chat Command

In chat:

- `/zone`  
  Uses the Scene's zone title (or Scene name).

- `/zone Cemetery of Ash`  
  Forces a custom title.

- `/zone Cemetery of Ash -- A Lonely Beginning`  
  Title + subtitle (anything after `--` is treated as the subtitle).

### API

From macro or console:

```js
game.namtaraZoneTitle.show("Cemetery of Ash", { subtitle: "A Lonely Beginning" });
```

## Settings

Found under **Configure Settings → Module Settings → Namtara Zone Title Popup**:

- **Display Duration (ms)**  
  How long the overlay is visible. Default: `3500`.

- **Zone Popup Sound Path**  
  File path to a sound in your Foundry data/Forge assets, e.g.:  
  `sounds/ui/zone-chime.ogg`

- **Zone Popup Sound Volume**  
  0.0–1.0, default `0.8`.

- **GM Only Trigger**  
  If enabled, only GMs may trigger `/zone`.

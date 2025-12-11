// scripts/zone-title.js

const ZT = {
  MODULE_ID: "namtara-zone-title"
};

class ZoneTitleOverlay extends Application {
  static instance = null;

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "namtara-zone-title-overlay",
      template: `modules/${ZT.MODULE_ID}/templates/zone-title-overlay.html`,
      popOut: false,
      resizable: false,
      minimizable: false
    });
  }

  constructor(data = {}, options = {}) {
    super(options);
    this.titleData = data;
  }

  getData(options = {}) {
    const data = super.getData(options);
    data.title = this.titleData.title || "";
    data.subtitle = this.titleData.subtitle || "";
    return data;
  }

  /**
   * Show the overlay for a short time, then hide it.
   */
  static async show(title, { subtitle = "" } = {}) {
    if (!title) return;

    const durationMs = Number(
      game.settings.get(ZT.MODULE_ID, "displayDuration")
    ) || 3500;

    const soundPath = game.settings.get(ZT.MODULE_ID, "soundPath");
    const volume = Number(game.settings.get(ZT.MODULE_ID, "soundVolume")) || 0.8;

    // Play sound if configured
    if (soundPath) {
      AudioHelper.play(
        { src: soundPath, volume, autoplay: true, loop: false },
        true
      );
    }

    // Reuse single instance
    if (!ZoneTitleOverlay.instance) {
      ZoneTitleOverlay.instance = new ZoneTitleOverlay({ title, subtitle });
    } else {
      ZoneTitleOverlay.instance.titleData = { title, subtitle };
    }

    const app = ZoneTitleOverlay.instance;
    await app.render(true);

    // Add fade-in class
    const html = app.element;
    html.addClass("zt-visible");

    // Hide after duration
    setTimeout(() => {
      if (!app.rendered) return;
      // fade out
      html.removeClass("zt-visible").addClass("zt-fade-out");
      setTimeout(() => {
        if (app.rendered) app.close();
      }, 500); // fade-out duration
    }, durationMs);
  }
}

/* -------------------- Settings & Hooks -------------------- */

Hooks.once("init", () => {
  console.log("Namtara Zone Title | Initializing");

  game.settings.register(ZT.MODULE_ID, "displayDuration", {
    name: "Display Duration (ms)",
    hint: "How long the zone title stays visible (in milliseconds). Default 3500.",
    scope: "world",
    config: true,
    type: Number,
    default: 3500
  });

  game.settings.register(ZT.MODULE_ID, "soundPath", {
    name: "Zone Popup Sound Path",
    hint: "Path to the sound file to play when the zone popup appears. Leave empty for no sound.",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  game.settings.register(ZT.MODULE_ID, "soundVolume", {
    name: "Zone Popup Sound Volume",
    hint: "Volume for the popup sound (0.0 - 1.0).",
    scope: "world",
    config: true,
    type: Number,
    default: 0.8
  });

  game.settings.register(ZT.MODULE_ID, "gmOnly", {
    name: "GM Only Trigger",
    hint: "If enabled, only GMs may trigger the zone popup via chat command.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
});

/**
 * Add a field to Scene configuration to override the zone title.
 */
Hooks.on("renderSceneConfig", (app, html, data) => {
  const zoneTitle =
    app.object.getFlag(ZT.MODULE_ID, "title") ?? "";

  const basicTab = html.find('.tab[data-tab="basic"]');
  if (!basicTab.length) return;

  const formGroup = `
    <div class="form-group">
      <label>Namtara Zone Title</label>
      <input type="text" name="flags.${ZT.MODULE_ID}.title" value="${zoneTitle}" data-dtype="String">
      <p class="notes">
        Optional custom zone title for this Scene. If empty, the Scene name is used.
      </p>
    </div>
  `;

  basicTab.append(formGroup);
});

/**
 * Chat command: /zone [optional custom title]
 * - If no title is given, uses scene flag or scene name.
 * - Optionally GM-only.
 */
Hooks.on("chatMessage", (chatLog, messageText, chatData) => {
  const msg = messageText.trim();
  if (!msg.startsWith("/zone")) return;

  const gmOnly = game.settings.get(ZT.MODULE_ID, "gmOnly");
  if (gmOnly && !game.user.isGM) {
    ui.notifications.warn("Only GMs can trigger the zone title popup.");
    return false;
  }

  const scene = game.scenes.current;
  if (!scene) {
    ui.notifications.warn("No active scene to read zone title from.");
    return false;
  }

  // Extract everything after "/zone"
  const args = msg.slice(5).trim(); // remove "/zone"
  let title = args;

  if (!title) {
    title = scene.getFlag(ZT.MODULE_ID, "title") || scene.name;
  }

  // Optional: detect a subtitle if user writes "Title -- Subtitle"
  let subtitle = "";
  const parts = title.split("--");
  if (parts.length > 1) {
    title = parts[0].trim();
    subtitle = parts.slice(1).join("--").trim();
  }

  ZoneTitleOverlay.show(title, { subtitle });

  // Prevent normal chat message
  return false;
});

/**
 * Convenience API
 * game.namtaraZoneTitle.show("My Zone", { subtitle: "A Lonely Place" });
 */
Hooks.once("ready", () => {
  game.namtaraZoneTitle = {
    show: (title, options) => ZoneTitleOverlay.show(title, options)
  };
  console.log("Namtara Zone Title | Ready");
});

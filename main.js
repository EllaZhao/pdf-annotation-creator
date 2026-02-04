var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PDFAnnotationCreator
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  template: `---
annotation-target: {{filename}}
---
`,
  suffix: "_annotation",
  openAnnotator: true
};
var PDFAnnotationCreator = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof import_obsidian.TFile && file.extension === "pdf") {
          menu.addItem((item) => {
            item.setTitle("\u{1F4DD} Create annotation note").setIcon("pencil").onClick(async () => {
              await this.createAnnotationNote(file);
            });
          });
        }
      })
    );
    this.addCommand({
      id: "create-annotation-for-active-pdf",
      name: "Create annotation note for selected PDF",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file && file.extension === "pdf") {
          if (!checking) {
            this.createAnnotationNote(file).catch(console.error);
          }
          return true;
        }
        return false;
      }
    });
    this.addSettingTab(new PDFAnnotationSettingTab(this.app, this));
    console.debug("PDF Annotation Creator loaded");
  }
  async createAnnotationNote(pdfFile) {
    const basename = pdfFile.basename;
    const filename = pdfFile.name;
    const folderPath = pdfFile.parent?.path || "";
    const content = this.settings.template.replace(/\{\{filename\}\}/g, filename).replace(/\{\{basename\}\}/g, basename).replace(/\{\{path\}\}/g, pdfFile.path);
    const noteName = `${basename}${this.settings.suffix}.md`;
    const notePath = folderPath ? `${folderPath}/${noteName}` : noteName;
    const existingFile = this.app.vault.getAbstractFileByPath(notePath);
    if (existingFile) {
      new import_obsidian.Notice(`Annotation note already exists: ${noteName}`);
      await this.app.workspace.openLinkText(notePath, "", true);
      return;
    }
    try {
      const newFile = await this.app.vault.create(notePath, content);
      new import_obsidian.Notice(`Created: ${noteName}`);
      await this.app.workspace.openLinkText(newFile.path, "", true);
      if (this.settings.openAnnotator) {
        setTimeout(() => {
          this.app.commands.executeCommandById("obsidian-annotator:open-as-annotation");
        }, 300);
      }
    } catch (error) {
      new import_obsidian.Notice(`Failed to create annotation note: ${error}`);
      console.error(error);
    }
  }
  onunload() {
    console.debug("PDF Annotation Creator unloaded");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var PDFAnnotationSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Note suffix").setDesc("Suffix added to the PDF filename for the annotation note").addText((text) => text.setPlaceholder("_annotation").setValue(this.plugin.settings.suffix).onChange(async (value) => {
      this.plugin.settings.suffix = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Auto-open annotator").setDesc("Automatically open the annotation view after creating the note").addToggle((toggle) => toggle.setValue(this.plugin.settings.openAnnotator).onChange(async (value) => {
      this.plugin.settings.openAnnotator = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Note template").setDesc("Template for the annotation note. Use {{filename}}, {{basename}}, {{path}} as placeholders.").addTextArea((text) => {
      text.setPlaceholder("Enter template...").setValue(this.plugin.settings.template).onChange(async (value) => {
        this.plugin.settings.template = value;
        await this.plugin.saveSettings();
      });
      text.inputEl.rows = 15;
      text.inputEl.cols = 50;
    });
  }
};

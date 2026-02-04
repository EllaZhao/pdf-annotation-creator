import { App, Plugin, TFile, TFolder, Notice, Menu, PluginSettingTab, Setting } from 'obsidian';

interface PDFAnnotationSettings {
    template: string;
    suffix: string;
    openAnnotator: boolean;
}

const DEFAULT_SETTINGS: PDFAnnotationSettings = {
    template: `---
annotation-target: {{filename}}
---
`,
    suffix: '_annotation',
    openAnnotator: true
};

export default class PDFAnnotationCreator extends Plugin {
    settings: PDFAnnotationSettings;

    async onload() {
        await this.loadSettings();

        // 注册右键菜单
        this.registerEvent(
            this.app.workspace.on('file-menu', (menu: Menu, file: TFile | TFolder) => {
                if (file instanceof TFile && file.extension === 'pdf') {
                    menu.addItem((item) => {
                        item
                            .setTitle('📝 Create annotation note')
                            .setIcon('pencil')
                            .onClick(async () => {
                                await this.createAnnotationNote(file);
                            });
                    });
                }
            })
        );

        // 注册命令（可用快捷键触发）
        this.addCommand({
            id: 'create-annotation-for-active-pdf',
            name: 'Create annotation note for selected PDF',
            checkCallback: (checking: boolean) => {
                const file = this.app.workspace.getActiveFile();
                if (file && file.extension === 'pdf') {
                    if (!checking) {
                        this.createAnnotationNote(file).catch(console.error);
                    }
                    return true;
                }
                return false;
            }
        });

        // 添加设置页
        this.addSettingTab(new PDFAnnotationSettingTab(this.app, this));

        console.debug('PDF Annotation Creator loaded');
    }

    async createAnnotationNote(pdfFile: TFile) {
        const basename = pdfFile.basename; // 不含扩展名
        const filename = pdfFile.name;     // 含扩展名
        const folderPath = pdfFile.parent?.path || '';

        // 生成笔记内容
        const content = this.settings.template
            .replace(/\{\{filename\}\}/g, filename)
            .replace(/\{\{basename\}\}/g, basename)
            .replace(/\{\{path\}\}/g, pdfFile.path);

        // 生成笔记路径
        const noteName = `${basename}${this.settings.suffix}.md`;
        const notePath = folderPath ? `${folderPath}/${noteName}` : noteName;

        // 检查是否已存在
        const existingFile = this.app.vault.getAbstractFileByPath(notePath);
        if (existingFile) {
            new Notice(`Annotation note already exists: ${noteName}`);
            // 打开已存在的笔记
            await this.app.workspace.openLinkText(notePath, '', true);
            return;
        }

        try {
            // 创建笔记
            const newFile = await this.app.vault.create(notePath, content);
            new Notice(`Created: ${noteName}`);

            // 打开笔记
            await this.app.workspace.openLinkText(newFile.path, '', true);

            // 尝试自动打开 Annotator（如果启用）
            if (this.settings.openAnnotator) {
                // 等待文件打开
                setTimeout(() => {
                    // @ts-ignore
                    this.app.commands.executeCommandById('obsidian-annotator:open-as-annotation');
                }, 300);
            }
        } catch (error) {
            new Notice(`Failed to create annotation note: ${error}`);
            console.error(error);
        }
    }

    onunload() {
        console.debug('PDF Annotation Creator unloaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class PDFAnnotationSettingTab extends PluginSettingTab {
    plugin: PDFAnnotationCreator;

    constructor(app: App, plugin: PDFAnnotationCreator) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('PDF Annotation Creator')
            .setHeading();

        new Setting(containerEl)
            .setName('Note suffix')
            .setDesc('Suffix added to the PDF filename for the annotation note')
            .addText(text => text
                .setPlaceholder('_annotation')
                .setValue(this.plugin.settings.suffix)
                .onChange(async (value) => {
                    this.plugin.settings.suffix = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Auto-open Annotator')
            .setDesc('Automatically open the annotation view after creating the note')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openAnnotator)
                .onChange(async (value) => {
                    this.plugin.settings.openAnnotator = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Note template')
            .setDesc('Template for the annotation note. Use {{filename}}, {{basename}}, {{path}} as placeholders.')
            .addTextArea(text => {
                text
                    .setPlaceholder('Enter template...')
                    .setValue(this.plugin.settings.template)
                    .onChange(async (value) => {
                        this.plugin.settings.template = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 15;
                text.inputEl.cols = 50;
            });
    }
}
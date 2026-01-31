# PDF Annotation Creator

A simple Obsidian plugin that adds a right-click menu option to create annotation notes for PDF files, designed to work seamlessly with the [Annotator](https://github.com/elias-sundqvist/obsidian-annotator) plugin.

## Features

- 📝 **Right-click to create**: Right-click any PDF → "Create Annotation Note"
- 🚀 **Auto-open Annotator**: Automatically opens the annotation view after creating the note
- ⚙️ **Customizable template**: Configure the note template in settings
- 📁 **Same folder**: Creates the annotation note in the same folder as the PDF

## Requirements

> ⚠️ **Important**: This plugin requires the [Annotator](https://github.com/elias-sundqvist/obsidian-annotator) plugin to be installed and enabled.

## Installation

### From Community Plugins (Recommended)

1. Open Obsidian Settings
2. Go to **Community Plugins** and disable **Safe Mode**
3. Click **Browse** and search for "PDF Annotation Creator"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/YOUR_USERNAME/obsidian-pdf-annotation-creator/releases)
2. Create a folder: `<vault>/.obsidian/plugins/pdf-annotation-creator/`
3. Copy the downloaded files into this folder
4. Restart Obsidian
5. Enable the plugin in **Settings → Community Plugins**

## Usage

1. Make sure you have a PDF file in your vault
2. Right-click on the PDF file in the file explorer
3. Click **"📝 Create Annotation Note"**
4. The annotation note is created and Annotator opens automatically

![Demo](demo.gif)

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Note suffix** | Suffix added to the annotation note filename | `_annotation` |
| **Auto-open Annotator** | Automatically open Annotator after creating the note | `true` |
| **Note template** | Template for the annotation note | See below |

### Default Template
```yaml
---
annotation-target: {{filename}}
---
```

### Available Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{filename}}` | Full filename with extension | `paper.pdf` |
| `{{basename}}` | Filename without extension | `paper` |
| `{{path}}` | Full path to the PDF | `Papers/paper.pdf` |

## Example

For a PDF file named `Attention_Is_All_You_Need.pdf` in the `Papers` folder:

- **Created note**: `Papers/Attention_Is_All_You_Need_annotation.md`
- **Note content**:
```yaml
  ---
  annotation-target: Attention_Is_All_You_Need.pdf
  ---
```

## Troubleshooting

### Annotator doesn't open automatically

1. Make sure Annotator plugin is installed and enabled
2. Try disabling and re-enabling "Auto-open Annotator" in settings
3. Manually open: `Cmd/Ctrl + P` → "Annotator: Open as Annotation"

### "Annotation note already exists" message

The plugin won't overwrite existing annotation notes. If you want to recreate:
1. Delete the existing `*_annotation.md` file
2. Right-click the PDF again

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/YOUR_USERNAME/obsidian-pdf-annotation-creator).

## License

[MIT](LICENSE)

## Acknowledgments

- [Annotator](https://github.com/elias-sundqvist/obsidian-annotator) - The core PDF annotation plugin this works with
- [Obsidian](https://obsidian.md) - The amazing note-taking app

# Download Station

This repository contains a PHP script designed to perform automated scraping tasks on the AnimeFLV website and handle related files on a Synology NAS system. The project is ideal for managing media content downloads, organizing series episodes, and checking existing files on a NAS.

## Project Structure

The project starts with the following directory structure:

```bash
download-station
├── generators
├── scss
├── custom
│ ├── 00-mixin
│ ├── 00-global
├── templates
│ ├── 00-globals
└── favicon.ico
```

## Features

- **Responsive Design**: The template adapts to different screen sizes.
- **Browser Compatible**: Works in the most commonly used browsers.
- **Easy Customization**: Modify the CSS and HTML to suit your needs.
- **Simple Documentation**: Clear instructions to get started.

## Installation

To use this template, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone git@github.com:miniricky/download-station.git

2. Navigate to the project folder:

    cd download-station

3. Use npm install to install the dependencies.

## Customization

- Styles: Edit or create the files in the scss/ folder to modify the look of the template (you need to add the css files to /_custom.scss).
- Scripts: Modify the files in js-src/ to add interactivity (you need to add the js file to the gulpfile).
- Images: Add images or icons in the images/ folder as needed.
- Components: You can create blocks or components in templates/01-components
- Template: Create a template in /generators and add the components with an include.

4. Use gulp build to generate the necessary files (css, js, templates)

> [!NOTE]
> Please make sure the directory structure and file information is accurate.
# Web Template

This repository contains a web template that can be used to develop both static and dynamic websites. It is designed to be a solid, flexible, and easily customizable foundation.

## Project Structure

The project starts with the following directory structure:

```bash
web-template
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
   git clone https://github.com/miniricky/web-template.git

2. Navigate to the project folder:

    cd web-template

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
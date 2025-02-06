# Ollama AI Chat Interface

## Overview
Web-based chat interface for AI models using Ollama, with multilingual support.

## Ollama Installation
Visit [https://ollama.com/download](https://ollama.com/download) and follow the instructions for your operating system.

## Installing and Running Models
To install and run a model (change deepseek-r1:8b for your preferred model):
```bash
# This command will download and install the model if not already present
ollama run deepseek-r1:8b
```

## Application Setup
1. Clone repository
2. Open `index.html` in browser
3. Ensure Ollama is running

## Configuration
- Edit `models.txt` to list available models
- Modify `translations.json` for language support

## Features
- Dynamic model selection
- Multilingual interface
- Code block copying
- Configurable send options

## Compatibility
- Modern browsers
- Local Ollama server required

## Contributing
Contributions welcome. Report issues on GitHub.

## License
MIT License

Copyright (c) [2005] [Adrián Núñez Ferdmann]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

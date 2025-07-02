# LaTeX Document Generator

A modern, containerized NestJS application for generating professional LaTeX documents with PDF rendering capabilities. Features an intuitive web interface for creating structured documents with chapters, sections, tables, and PDF insertions.

## 🚀 Features

### ✨ Core Functionality
- **Object-Oriented Document Structure**: Create documents with chapters, sections, and tables using TypeScript classes
- **PDF Insertion**: Upload and insert PDF files at specific positions in your document
- **Custom File Naming**: Choose custom names for your generated LaTeX and PDF files
- **Modern Web Interface**: Beautiful, responsive UI with real-time feedback
- **File Management**: View, download, and delete LaTeX documents and generated PDFs

### 🎨 User Interface
- **Dark Theme**: Modern, professional dark interface with gradient styling
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Validation**: Instant feedback on form inputs and validation
- **Loading States**: Visual feedback during document processing
- **File Management**: Easy-to-use interface for managing your documents

### 🔧 Technical Features
- **Docker Containerization**: Complete containerized solution with LaTeX support
- **NestJS Backend**: Robust TypeScript API with proper error handling
- **LaTeX Compilation**: Full LaTeX environment with comprehensive packages
- **File Upload**: Secure file handling with automatic naming and validation

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Git** for cloning the repository
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd miktex
```

### 2. Build and Run with Docker
```bash
# Build and start the application
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

The application will be ready to use once the container finishes building (this may take a few minutes on first run as it installs LaTeX packages).

## 📖 How to Use

### Creating a Document

#### 1. Basic Information
- **Document Title**: Enter the title of your document
- **Author**: Specify the document author
- **Custom Filename** (Optional): Choose a custom name for your LaTeX file (without extension)

#### 2. Document Structure
- **Chapters**: Add chapters to organize your content
  - Click "Add Chapter" to create new chapters
  - Each chapter requires a title
- **Sections**: Add sections within each chapter
  - Click "Add Section" within a chapter
  - Sections require a title and can include content
- **Tables**: Add tables within sections
  - Click "Add Table" within a section
  - Specify table caption, headers, and data rows

#### 3. PDF Insertion
- **Upload PDFs**: Select PDF files to include in your document
- **Position Selection**: Choose where to insert each PDF:
  - "Insert at end" - Adds PDF at the end of the document
  - "After Chapter X" - Inserts PDF after a specific chapter
- **Multiple PDFs**: Upload and position multiple PDFs in one document

#### 4. Create Document
- Click "Create Document" to generate your LaTeX file
- The system will validate all required fields
- Success messages will appear with the generated filename

### Managing Documents

#### View Documents
- Click "Refresh Files" to load current documents
- View all LaTeX documents in the "LaTeX Documents" section
- View all generated PDFs in the "Generated PDFs" section

#### Document Actions
For each LaTeX document:
- **Compile**: Convert LaTeX to PDF
- **View**: Open LaTeX source code in a new window
- **Delete**: Remove the document (with confirmation)

For each PDF:
- **Download**: Download the PDF file
- **Delete**: Remove the PDF (with confirmation)

#### Example Document
- Click "Create Example" to generate a sample document
- Useful for testing the system or as a starting template

## 🏗️ Architecture

### Backend (NestJS)
```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Main application module
└── latex/
    ├── latex.module.ts    # LaTeX module configuration
    ├── latex.controller.ts # API endpoints
    ├── latex.service.ts   # Document generation logic
    ├── pdf.service.ts     # PDF compilation service
    ├── models/
    │   └── tex-document.ts # OOP document classes
    └── dto/
        └── create-document.dto.ts # Data transfer objects
```

### Object-Oriented Design
- **TexDocument**: Main container class with title, author, chapters, and PDF inserts
- **TexChapter**: Contains sections and generates `\chapter{}` commands
- **TexSection**: Contains content and tables, generates `\section{}` commands
- **TexTable**: Structured tables with headers/rows, generates tabular environment
- **PdfInsert**: Handles PDF file insertion at specific positions

### Frontend
- **Single HTML File**: Complete application in `frontend.html`
- **Modern CSS**: Dark theme with gradients and animations
- **Vanilla JavaScript**: No framework dependencies
- **Responsive Design**: Works on all device sizes

## 🔧 API Endpoints

### Document Management
- `POST /latex/create-document` - Create new LaTeX document
- `GET /latex/documents` - List all LaTeX documents
- `GET /latex/document/:filename` - Get LaTeX document content
- `POST /latex/delete-document/:filename` - Delete LaTeX document

### PDF Operations
- `POST /latex/compile/:filename` - Compile LaTeX to PDF
- `GET /latex/pdfs` - List all generated PDFs
- `GET /latex/pdf/:filename` - Download PDF file
- `POST /latex/delete-pdf/:filename` - Delete PDF file

### Utilities
- `POST /latex/example-document` - Create example document

## 🐳 Docker Configuration

### Container Setup
- **Base Image**: Node.js 18 with Debian Bullseye
- **LaTeX Environment**: Full TeX Live installation with all necessary packages
- **Port**: 3000 (accessible at http://localhost:3000)
- **Volumes**: 
  - `./generated` - Generated LaTeX and PDF files
  - `./uploads` - Uploaded PDF files

### LaTeX Packages Included
- `texlive-latex-base` - Basic LaTeX packages
- `texlive-latex-recommended` - Recommended LaTeX packages
- `texlive-latex-extra` - Extra LaTeX packages
- `texlive-fonts-recommended` - Recommended fonts
- `texlive-science` - Scientific packages
- `texlive-pictures` - Graphics packages
- `pdfpages` - PDF inclusion package
- `geometry` - Page layout package
- `fancyhdr` - Header/footer package

## 🚨 Troubleshooting

### Common Issues

#### 1. Docker Build Fails
```bash
# Clean up and rebuild
docker-compose down
docker system prune -f
docker-compose up --build
```

#### 2. Port Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Or change port in docker-compose.yml
```

#### 3. PDF Compilation Errors
- Ensure uploaded PDFs are valid and not corrupted
- Check that PDF filenames don't contain special characters
- Verify LaTeX syntax in generated documents

#### 4. File Permission Issues
```bash
# Ensure proper permissions
chmod 755 generated uploads
```

### Debug Mode
- Open browser Developer Tools (F12)
- Check Console tab for detailed logging
- All operations are logged with timestamps and details

## 📝 Example Usage

### Creating a Research Paper
1. **Title**: "Machine Learning Applications in Healthcare"
2. **Author**: "Dr. Jane Smith"
3. **Custom Filename**: "ml-healthcare-paper"
4. **Chapters**:
   - Chapter 1: "Introduction"
     - Section: "Background"
     - Section: "Objectives"
   - Chapter 2: "Methodology"
     - Section: "Data Collection"
     - Table: "Dataset Statistics"
5. **PDF Insertion**: Upload research data PDF after Chapter 2
6. **Compile**: Generate final PDF

### Creating a Technical Report
1. **Title**: "System Architecture Review"
2. **Author**: "Engineering Team"
3. **Chapters**:
   - Chapter 1: "Overview"
   - Chapter 2: "Current System"
   - Chapter 3: "Proposed Changes"
4. **PDF Insertion**: Add system diagrams PDF after Chapter 1
5. **Compile**: Create professional report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Check Docker logs: `docker-compose logs -f`
4. Create an issue with detailed error information

---

**Happy Document Generation! 📄✨** 
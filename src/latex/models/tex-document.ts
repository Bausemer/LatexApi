export class TexDocument {
  private documentClass: string;
  private packages: string[];
  private title: string;
  private author: string;
  private chapters: TexChapter[];
  private pdfInserts: PdfInsert[];

  constructor(
    title: string = 'Document',
    author: string = 'Author',
    documentClass: string = 'report'
  ) {
    this.title = title;
    this.author = author;
    this.documentClass = documentClass;
    this.packages = [
      'geometry',
      'graphicx',
      'amsmath',
      'amsfonts',
      'amssymb',
      'fancyhdr',
      'pdfpages'
    ];
    this.chapters = [];
    this.pdfInserts = [];
  }

  addPackage(packageName: string): void {
    if (!this.packages.includes(packageName)) {
      this.packages.push(packageName);
    }
  }

  addChapter(chapter: TexChapter): void {
    this.chapters.push(chapter);
  }

  addPdfInsert(pdfPath: string, afterPage?: number): void {
    // Only add valid PDF inserts
    if (pdfPath && pdfPath !== 'undefined' && !pdfPath.includes('undefined')) {
      this.pdfInserts.push({ pdfPath, afterPage });
    }
  }

  generateLatex(): string {
    let latex = `\\documentclass{${this.documentClass}}\n\n`;
    
    // Add packages
    this.packages.forEach(pkg => {
      latex += `\\usepackage{${pkg}}\n`;
    });
    
    latex += '\n';
    latex += `\\title{${this.title}}\n`;
    latex += `\\author{${this.author}}\n`;
    latex += '\\date{\\today}\n\n';
    
    latex += '\\begin{document}\n\n';
    latex += '\\maketitle\n\n';
    
    // Add chapters with PDF inserts
    this.chapters.forEach((chapter, index) => {
      latex += chapter.generateLatex();
      
      // Check for PDF inserts after this chapter
      const pageNumber = index + 1;
      const pdfInsert = this.pdfInserts.find(insert => insert.afterPage === pageNumber);
      if (pdfInsert) {
        latex += `\\includepdf[pages=-]{${pdfInsert.pdfPath}}\n\n`;
      }
    });
    
    // Add any remaining PDF inserts at the end
    const endInserts = this.pdfInserts.filter(insert => !insert.afterPage);
    endInserts.forEach(insert => {
      latex += `\\includepdf[pages=-]{${insert.pdfPath}}\n\n`;
    });
    
    latex += '\\end{document}';
    
    return latex;
  }
}

export class TexChapter {
  private title: string;
  private sections: TexSection[];

  constructor(title: string) {
    this.title = title;
    this.sections = [];
  }

  addSection(section: TexSection): void {
    this.sections.push(section);
  }

  generateLatex(): string {
    let latex = `\\chapter{${this.title}}\n\n`;
    
    this.sections.forEach(section => {
      latex += section.generateLatex();
    });
    
    return latex;
  }
}

export class TexSection {
  private title: string;
  private content: string;
  private tables: TexTable[];

  constructor(title: string, content: string = '') {
    this.title = title;
    this.content = content;
    this.tables = [];
  }

  addTable(table: TexTable): void {
    this.tables.push(table);
  }

  setContent(content: string): void {
    this.content = content;
  }

  generateLatex(): string {
    let latex = `\\section{${this.title}}\n\n`;
    
    if (this.content) {
      latex += `${this.content}\n\n`;
    }
    
    this.tables.forEach(table => {
      latex += table.generateLatex();
    });
    
    return latex;
  }
}

export class TexTable {
  private caption: string;
  private headers: string[];
  private rows: string[][];
  private alignment: string;

  constructor(caption: string, headers: string[], alignment?: string) {
    this.caption = caption;
    this.headers = headers;
    this.rows = [];
    this.alignment = alignment || 'c'.repeat(headers.length);
  }

  addRow(row: string[]): void {
    if (row.length === this.headers.length) {
      this.rows.push(row);
    } else {
      throw new Error(`Row must have ${this.headers.length} columns`);
    }
  }

  generateLatex(): string {
    let latex = '\\begin{table}[h!]\n';
    latex += '\\centering\n';
    latex += `\\caption{${this.caption}}\n`;
    latex += `\\begin{tabular}{|${this.alignment.split('').join('|')}|}\n`;
    latex += '\\hline\n';
    
    // Add headers
    latex += this.headers.join(' & ') + ' \\\\\n';
    latex += '\\hline\n';
    
    // Add rows
    this.rows.forEach(row => {
      latex += row.join(' & ') + ' \\\\\n';
      latex += '\\hline\n';
    });
    
    latex += '\\end{tabular}\n';
    latex += '\\end{table}\n\n';
    
    return latex;
  }
}

interface PdfInsert {
  pdfPath: string;
  afterPage?: number;
} 
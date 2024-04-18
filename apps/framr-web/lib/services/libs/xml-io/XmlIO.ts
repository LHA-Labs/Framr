import {
  Builder,
  Parser,
  convertableToString as ConvertableToString,
} from 'xml2js';
import { FramrServiceError } from '../errors';

export class XmlIO {
  private readonly _xmlParser: Parser;
  public get xmlParser(): Parser {
    return this._xmlParser;
  }

  private readonly _xmlBuilder: Builder;
  public get xmlBuilder(): Builder {
    return this._xmlBuilder;
  }

  constructor() {
    this._xmlParser = new Parser({});
    this._xmlBuilder = new Builder({});
  }

  /**
   * Parse XML from file
   * @param file
   * @returns
   */
  async parseFromFile(file: File): Promise<object> {
    try {
      const xmlString = await this.readFileAsText(file);
      return await this.parse(xmlString);
    } catch (error) {
      throw new FramrServiceError(
        `Error reading or parsing XML file: ${error}`
      );
    }
  }

  /**
   * Build XML and download as file
   * @param obj
   * @param fileName
   */
  buildAndDownload(obj: object, fileName: string = 'export.xml'): void {
    try {
      const xmlString = this.xmlBuilder.buildObject(obj);
      this.downloadXmlFile(xmlString, fileName);
    } catch (error) {
      throw new FramrServiceError(`Error building XML: ${error}`);
    }
  }

  /**
   * Dowlaod XML file
   * @param xmlString
   * @param fileName
   */
  private downloadXmlFile(xmlString: string, fileName: string): void {
    const blob = new Blob([xmlString], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Read file as text
   * @param file imported file
   * @returns
   */
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result.toString());
        } else {
          reject(new FramrServiceError('Failed to read file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * Parse XML string
   */
  private async parse(xmlString: ConvertableToString): Promise<object> {
    try {
      return await this.xmlParser.parseStringPromise(xmlString);
    } catch (error) {
      throw new FramrServiceError(`Error parsing XML: ${error}`);
    }
  }
}
declare module 'piexifjs' {
  interface PiexifStatic {
    load(dataUrl: string): Record<string, unknown>;
    dump(exifObj: Record<string, unknown>): string;
    insert(exifBytes: string, dataUrl: string): string;
    remove(dataUrl: string): string;

    ImageIFD: {
      Make: number;
      Model: number;
      Orientation: number;
      Software: number;
      DateTime: number;
      [key: string]: number;
    };

    ExifIFD: {
      DateTimeOriginal: number;
      DateTimeDigitized: number;
      ExposureTime: number;
      FNumber: number;
      ISOSpeedRatings: number;
      [key: string]: number;
    };

    GPSIFD: {
      GPSLatitudeRef: number;
      GPSLatitude: number;
      GPSLongitudeRef: number;
      GPSLongitude: number;
      GPSAltitudeRef: number;
      GPSAltitude: number;
      [key: string]: number;
    };
  }

  const piexif: PiexifStatic;
  export default piexif;
}

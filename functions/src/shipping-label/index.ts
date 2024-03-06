import express from "express";
import fs from "fs";
import { range } from "lodash";
import path from "path";
import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  StandardFonts,
  closePath,
  fill,
  lineTo,
  moveTo,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setFillingColor,
} from "pdf-lib";
import { Readable } from "stream";
import { getErrorMessage, reportError } from "../utils";

const BURGUNDY = rgb(0.8, 0.2, 0.4);
const BLACK = rgb(0, 0, 0);

function estimateTextBoxWidth(text: string, fontSize: number, font: PDFFont) {
  // Calculate the width of the text
  const width = font.widthOfTextAtSize(text, fontSize);
  return width;
}

const getLogo = async (pdfDoc: PDFDocument): Promise<PDFImage> => {
  const imagePath = path.resolve(__dirname, "../../../assets/code-logo.png");
  const imageBytes = fs.readFileSync(imagePath);

  // Embed image in PDF
  return await pdfDoc.embedPng(imageBytes);
};

/**
 * Scale and draw an image on a PDF page
 * @param {PDFDocument} pdfDoc The PDF document object
 * @param {any} page The PDF page object
 * @param {PDFImage} image The PNG image object to be drawn
 * @param {number} x The x-coordinate of the image
 * @param {number} y The y-coordinate of the image
 * @param {number} scaleFactor The scale factor for the image
 */
const drawLogo = async ({
  pdfDoc,
  page,
  x = 50,
  y = 50,
  scaleFactor = 0.2,
}: {
  pdfDoc: PDFDocument;
  page: any;
  x?: number;
  y?: number;
  scaleFactor?: number;
}): Promise<void> => {
  // get the logo
  const image = await getLogo(pdfDoc);
  const imageSize = image.scale(scaleFactor);
  page.drawImage(image, {
    x,
    y,
    width: imageSize.width,
    height: imageSize.height,
  });
};

const drawPostageRequired = async ({
  page,
  pageWidth,
  pageHeight,
  width = 120,
  height = 140,
  font,
  paddingRright = 50,
  paddingTop = 70,
}: {
  page: PDFPage;
  pageWidth: number;
  pageHeight: number;
  width?: number;
  height?: number;
  font: PDFFont;
  paddingRright: number;
  paddingTop: number;
}) => {
  // Add text "POSTAGE REQUIRED"
  const textSize = 13;
  const postage = "POSTAGE";
  const required = "REQUIRED";

  // find the x position of the box. this is the width of the page - the width of the box and padding
  const boxPositionX: number = pageWidth - width - paddingRright;
  const boxPositionY: number = pageHeight - height - paddingTop;

  // Draw border rectangle
  page.drawRectangle({
    x: boxPositionX,
    y: boxPositionY,
    width: width,
    height: height,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 1,
  });

  let estimatedWidth = estimateTextBoxWidth(postage, 13, font);
  let textX = boxPositionX + (width - estimatedWidth) / 2;
  // find the y position of the text. this is positionY of the rectangle -
  let textY = boxPositionY + height / 2 - (textSize - 20);

  page.drawText(postage, {
    x: textX,
    y: textY,
    size: textSize,
    color: rgb(0.5, 0.5, 0.5),
  });

  estimatedWidth = estimateTextBoxWidth(required, 13, font);
  textX = boxPositionX + (width - estimatedWidth) / 2;
  textY = boxPositionY + height / 2 - (textSize + 10);

  page.drawText(required, {
    x: textX,
    y: textY,
    size: textSize,
    color: rgb(0.5, 0.5, 0.5),
  });
};

// Function to draw address lines
function drawAddress({
  page,
  addressDetails,
  xPosition,
  startYPosition,
  lineSpacing,
  textSize,
  font,
}: {
  page: PDFPage;
  addressDetails: any;
  xPosition: number;
  startYPosition: number;
  lineSpacing: number;
  textSize: number;
  font: any;
}) {
  let currentY = startYPosition;
  const { company, address, zip_code, city, country } = addressDetails;

  const lines = [company, address, `${zip_code} ${city}`, country];

  lines.forEach((line) => {
    page.drawText(line, {
      x: xPosition,
      y: currentY,
      size: textSize,
      font,
      color: BLACK,
    });
    currentY -= lineSpacing;
  });
}

const drawDottedLine = (
  page: PDFPage,
  yValue: number = 465,
  iterate: number = 80
) => {
  range(iterate).map((i) => {
    page.drawLine({
      start: { x: 50 + 6 * i, y: yValue },
      end: { x: 53 + 6 * i, y: yValue },
      thickness: 1,
      color: BLACK,
    });
  });
};

enum TriangleDirection {
  Upward = "upward",
  Downward = "downward",
}

function drawTriangle({
  page,
  xOffset,
  yOffset,
  direction,
}: {
  page: any;
  xOffset: number;
  yOffset: number;
  direction: TriangleDirection;
}): void {
  const scale = 0.4; // Adjust the scale factor as needed

  page.pushOperators(
    pushGraphicsState(),
    moveTo(xOffset, yOffset),
    lineTo(xOffset + 50 * scale, yOffset), // Adjusted x-coordinate for the line's end point
    lineTo(
      xOffset + 25 * scale,
      direction === TriangleDirection.Upward ? 12 + yOffset : -12 + yOffset
    ), // Adjusted y-coordinate based on direction
    closePath(),
    setFillingColor(BURGUNDY), // Adjusted RGB values for a brighter burgundy color
    fill(),
    popGraphicsState()
  );
}

const drawLabelSection = (page: PDFPage): void => {
  const smallFontSize = 10;
  drawTriangle({
    page,
    xOffset: 100,
    yOffset: 400,
    direction: TriangleDirection.Upward,
  });

  const xOffset = 100;
  const yOffset = 400;
  drawTriangle({
    page,
    xOffset: 450,
    yOffset: 400,
    direction: TriangleDirection.Upward,
  });

  page.drawText("Please paste this address label on the outside of the box", {
    size: smallFontSize,
    x: xOffset + 50,
    y: yOffset,
    color: BURGUNDY,
  });

  drawDottedLine(page, yOffset - 35);

  drawTriangle({
    page,
    xOffset: 100,
    yOffset: 330,
    direction: TriangleDirection.Downward,
  });

  drawTriangle({
    page,
    xOffset: 450,
    yOffset: 330,
    direction: TriangleDirection.Downward,
  });

  page.drawText(
    "Please put this part inside the box on top of your products,",
    {
      size: smallFontSize,
      x: xOffset + 50,
      y: yOffset - 80,
      color: BURGUNDY,
    }
  );
  page.drawText("so we can identify your return parcel upon arrival", {
    size: smallFontSize,
    x: xOffset + 70,
    y: yOffset - 93,
    color: BURGUNDY,
  });
};

export interface Payload {
  return_address: {
    company: string;
    address: string;
    zip_code: string;
    city: string;
    country: string;
  };
  order: string;
  name: string;
  language: string;
}

export function isValidPayload(payload: Payload): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  // Check if all required fields are present
  if (!payload.return_address || !payload.order || !payload.name) {
    return false;
  }

  // Check if field types are correct
  if (
    typeof payload.return_address.company !== "string" ||
    typeof payload.return_address.address !== "string" ||
    typeof payload.return_address.zip_code !== "string" ||
    typeof payload.return_address.city !== "string" ||
    typeof payload.return_address.country !== "string" ||
    typeof payload.order !== "string" ||
    typeof payload.name !== "string" ||
    typeof payload.language !== "string"
  ) {
    return false;
  }
  return true;
}

/**
 * Route: get the shipping label
 *
 * @param req Express request
 * @param res Express response
 */
export const shippingLabel = async (
  req: express.Request,
  res: express.Response
) => {
  //  Cast payload to Payload type
  const payload: Payload = req.body as Payload;
  if (!isValidPayload(payload)) {
    const error = new Error("Invalid payload format");
    reportError({ message: getErrorMessage(error) });
    return res.status(400).send(error.message);
  }

  // PDF Creation
  try {
    const pdfDoc: PDFDocument = await PDFDocument.create();
    const helvetica: PDFFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold: PDFFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );
    const fontSize: number = 17;
    // Add a page to the PDF
    const page: PDFPage = pdfDoc.addPage();
    // get dimensions of the page
    const {
      width: pageWidth,
      height: pageHeight,
    }: { width: number; height: number } = page.getSize();

    // place the logo
    await drawLogo({
      pdfDoc,
      page,
      x: 50,
      y: pageHeight - 120,
    });

    // POSTAGE REQUIRED on upper right
    drawPostageRequired({
      page,
      pageWidth,
      pageHeight,
      width: 120,
      height: 140,
      font: helvetica,
      paddingRright: 50,
      paddingTop: 70,
    });

    // draw the address
    const startYPosition = pageHeight - 180;
    const lineSpacing = 24;
    drawAddress({
      page,
      addressDetails: payload.return_address,
      xPosition: 50,
      startYPosition,
      lineSpacing,
      textSize: fontSize,
      font: helveticaBold,
    });

    // address label section
    drawLabelSection(page);

    page.drawText("Order Number:", {
      font: helvetica,
      size: fontSize + 5,
      x: 50,
      y: 180,
      color: BLACK,
    });

    page.drawText(payload.order, {
      font: helveticaBold,
      size: fontSize + 5,
      x: 230,
      y: 180,
      color: BLACK,
    });

    page.drawText("Name:", {
      font: helvetica,
      size: fontSize + 5,
      x: 50,
      y: 120,
      color: BLACK,
    });

    page.drawText(payload.name, {
      font: helveticaBold,
      size: fontSize + 5,
      x: 230,
      y: 120,
      color: BLACK,
    });

    const pdfBytes = await pdfDoc.save();

    // Set response headers
    const filename = "ship-label.pdf";
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(filename)}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Create a readable stream from the PDF buffer and pipe it to the response
    const stream = new Readable();
    stream.push(pdfBytes);
    stream.push(null); // Signal end of stream

    stream.pipe(res);

    // // Stream the PDF buffer to the client
  } catch (error) {
    reportError({ message: getErrorMessage(error) });
    res.status(500).send("Error generating PDF");
  }
};

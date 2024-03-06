import { Payload, isValidPayload } from "../shipping-label";

describe("isValidPayload", () => {
  test("returns false if payload is null", () => {
    const payload: any = null;
    expect(isValidPayload(payload)).toBe(false);
  });

  test("returns false if payload is not an object", () => {
    const payload: any = "not an object";
    expect(isValidPayload(payload)).toBe(false);
  });

  test("returns false if payload is missing required fields", () => {
    const payload: any = {
      // Missing return_address, order, name, language
    };
    expect(isValidPayload(payload)).toBe(false);
  });

  test("returns false if payload contains incorrect field types", () => {
    const payload: any = {
      return_address: {
        company: "Company",
        address: "Address",
        zip_code: "12345",
        city: "City",
        country: "Country",
      },
      order: 123, // Incorrect type
      name: "Name",
      language: "Language",
    };
    expect(isValidPayload(payload)).toBe(false);
  });

  test("returns true if payload has all required fields and correct types", () => {
    const payload: Payload = {
      return_address: {
        company: "Company",
        address: "Address",
        zip_code: "12345",
        city: "City",
        country: "Country",
      },
      order: "Order",
      name: "Name",
      language: "",
    };
    expect(isValidPayload(payload)).toBe(true);
  });
});

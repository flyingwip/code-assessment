# CODE App Assessment

This assessment is designed to assess your skills. For this assessment you do not need to deploy anything. Everything can be developed and tested offline (only for NPM package you need a connection). You should also not need an actual connection with a Shopify store.

## Create a shipping label for a return

In most cases we can provide shipping labels from existing carriers. But in some cases you want to create a shipping label which is a simple PDF file that is used as shipping label. The customer then pays for the shipment at the postal office.

Your assignment is to create a PDF label based on a return address that is supplied as argument. In the `assets` folder there is an `sample-label.pdf` attached. The endresult should look like that PDF.
Furthermore a `code-logo.png` is attached which can be used in your implementation.

We have setup a simple Express environment that you can use to build your implementation. It can be found in the `functions` folder. 
Please implement your solution in the `src/shipping-label` folder so it will be accessible via the route `/get-label`.

Your implementation should be testable via this route:

`POST https://localhost:3000/get-label`

Payload: 
```json
{
    "return_address": {
        "company": "CODE Internet Applications",
        "address": "Frederik Matthesstraat 30",
        "zip_code": "2613 ZZ",
        "city": "Delft",
        "country": "The Netherlands"
    },
    "order": "CODE-1339",
    "name": "Test User",
    "language": "en"
}
```


### Requirements

* Build the solution in Typescript
* Feel free to use any package you want to generate the PDF
* Make an HTTPS endpoint in Express that provides the PDF as output
* Please think about comments in your code
* Think about a logical way to structurize your code
* Bonus points if you write additional tests for your implementation
* Bonus points if you make the label multilingual

## Installation and development

* Use `npm i` or equivalent to install all the package 
* Run `npm run start` to start the server
* You should see `Hello world!` when you open your browser with the URL `https://localhost:3000`
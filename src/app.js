// Copyright (c) 2020 Allan Mobley. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { PdfPrinter } from "pdfmake/src/printer"

if (!window.Mobsites) {
	window.Mobsites = {
		Blazor: {

		}
	};
}

window.Mobsites.Blazor.PdfMake = {
    init: function () {
        this.pdfPrinter = new PdfPrinter(
        {
            Roboto: 
            {
                normal: '_content/Mobsites.Blazor.PdfMake/fonts/Roboto-Regular.ttf',
                bold: '_content/Mobsites.Blazor.PdfMake/fonts/Roboto-Medium.ttf',
                italics: '_content/Mobsites.Blazor.PdfMake/fonts/Roboto-Italic.ttf',
                bolditalics: '_content/Mobsites.Blazor.PdfMake/fonts/Roboto-MediumItalic.ttf'
            }
        });
    }
}
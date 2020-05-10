// Copyright (c) 2020 Allan Mobley. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import pdfjsLib from "pdfjs-dist/build/pdf"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry"
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Could not get import statement to load module
var pdfjsViewer = require('pdfjs-dist/web/pdf_viewer.js');

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
    console.log("Missing one or both global objects needed for pdf viewer.");
}

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "_content/Mobsites.Blazor.PdfMake/bundle.js";

// Set fonts outside of our object on global object.
pdfMake.vfs = pdfFonts.pdfMake.vfs;

if (!window.Mobsites) {
    window.Mobsites = {
        Blazor: {

        }
    };
}

window.Mobsites.Blazor.PdfMake = {
    store: [],
    init: function (dotNetObjRef, elemRefs, docDefinition, options) {
        try {
            const index = this.add(new Mobsites_Blazor_PdfMake(dotNetObjRef, elemRefs, docDefinition, options));
            dotNetObjRef.invokeMethodAsync('SetIndex', index);
            this.initResizeEvent();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    add: function (pdfMake) {
        for (let i = 0; i < this.store.length; i++) {
            if (this.store[i] == null)
            {
                this.store[i] = pdfMake;
                return i;
            }
        }
        const index = this.store.length;
        this.store[index] = pdfMake;
        return index;
    },
    update: function (index, options) {
        this.store[index].update(options);
    },
    destroy: function (index) {
        this.store[index] = null;
    },
    initResizeEvent: function () {
        if (this.store.length == 1)
            window.addEventListener('resize', this.resize);
    },
    resize: function () {
        // Prevent window.resize event from double firing.
        clearTimeout(window.Mobsites.Blazor.PdfMake.timeoutId);
        // Delay the resize handling by 200ms
        window.Mobsites.Blazor.PdfMake.timeoutId = setTimeout(() => {
            window.Mobsites.Blazor.PdfMake.store.forEach(obj => {
                if (obj && obj.resize) {
                    obj.resize();
                }
            });
        }, 200);
    },
    makePDF: function (docDefinition) {
        try {
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getDataUrl((dataUrl) => {
                const targetElement = document.querySelector('#iframeContainer');
                const iframe = document.createElement('iframe');
                iframe.src = dataUrl;
                iframe.classList.add("w-100");
                targetElement.appendChild(iframe);
            });
        } catch (error) {
            console.log(error);
        }
    },
    setPDF: function (iframe, docDefinition) {
        try {
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getDataUrl((dataUrl) => {
                iframe.src = dataUrl;
            });
        } catch (error) {
            console.log(error);
        }
    },
    toDataURL: function (docDefinition) {
        try {
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getDataUrl((dataUrl) => {
                console.log(dataUrl);
                return dataUrl;
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    // toImageDataURL: function (url) {
    //     return fetch(url)
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response failed.');
    //             }
    //             return response.arrayBuffer();
    //         })
    //         .then(buffer => {
    //             return 'data:image/jpeg;base64,' + this.arrayBufferToBase64(buffer);
    //         })
    //         .catch(error => {
    //             console.error('Mobsites.Blazor.PdfMake.toImageDataURL() failure:', error);
    //             return null;
    //         });
    // },
    // arrayBufferToBase64: function (buffer) {
    //     var binary = '';
    //     var bytes = [].slice.call(new Uint8Array(buffer));

    //     bytes.forEach((b) => binary += String.fromCharCode(b));

    //     return window.btoa(binary);
    // }
}

class Mobsites_Blazor_PdfMake {
    constructor(dotNetObjRef, elemRefs, docDefinition, options) {
        this.dotNetObjRef = dotNetObjRef;
        this.elemRefs = elemRefs;
        this.docDefinition = docDefinition;
        this.dotNetObjOptions = options;
        this.docGenerator = pdfMake.createPdf(docDefinition);
        this.loadingTask = null;
        this.document = null;
        this.eventBus = new pdfjsViewer.EventBus();
        this.linkService = new pdfjsViewer.PDFLinkService({
            eventBus: this.eventBus,
        });
        this.l10n = pdfjsViewer.NullL10n;
        this.viewer = new pdfjsViewer.PDFViewer({
            container: this.elemRefs.container,
            eventBus: this.eventBus,
            linkService: this.linkService,
            l10n: this.l10n,
            // useOnlyCssZoom: true,
            //textLayerMode: 0 // DISABLE
        });
        this.linkService.setViewer(this.viewer);
        this.history = new pdfjsViewer.PDFHistory({
            eventBus: this.eventBus,
            linkService: this.linkService,
          });
        this.linkService.setHistory(this.history);
        var self = this;
        this.elemRefs.previous.addEventListener("click", function () {
            self.page--;
        });
        this.elemRefs.next.addEventListener("click", function () {
            self.page++;
        });
        this.elemRefs.zoomIn.addEventListener("click", function () {
            self.zoomIn();
        });
        this.elemRefs.zoomOut.addEventListener("click", function () {
            self.zoomOut();
        });
        this.elemRefs.pageNumber.addEventListener("click", function () {
            this.select();
        });
        this.elemRefs.pageNumber.addEventListener("change", function () {
            self.page = this.value | 0;
      
            // Ensure that the page number input displays the correct value,
            // even if the value entered by the user was invalid
            // (e.g. a floating point number).
            if (this.value !== self.page.toString()) {
                this.value = self.page;
            }
        });
        this.eventBus.on("pagesinit", function () {
            // We can use pdfViewer now, e.g. let's change default scale.
            self.viewer.currentScaleValue = "auto";
        });
        this.eventBus.on(
            "pagechanging",
            function (evt) {
                var page = evt.pageNumber;
                var numPages = self.pagesCount;
        
                self.elemRefs.pageNumber.value = page;
                self.elemRefs.previous.disabled = page <= 1;
                self.elemRefs.next.disabled = page >= numPages;
            },
            true
        );
        // this.open({url: '_content/Shared/compressed.tracemonkey-pldi-09.pdf' });
        // this.toBase64().then(data => {
        //     this.open({ data: window.atob(data) });
        //     // console.log(data);
        // });
        this.toBuffer().then(buffer => {
            this.open({ data: buffer });
        });
    }
    update(options) {
        this.dotNetObjOptions = options;
    }
    resize() {
        this.open({ url: this.url, data: this.data });
    }
    open(options) {
        if (this.loadingTask) {
            // We need to destroy already opened document
            return this.close().then(
                function () {
                // ... and repeat the open() call.
                return this.open(options);
                }.bind(this)
            );
        }

        var url = options.url;
        var self = this;
        self.data = options.data;
        this.setTitleUsingUrl(url);
        this.loadingTask = pdfjsLib.getDocument({ data: options.data });
        // this.loadingTask = pdfjsLib.getDocument({
        //     url: url,
        //     data: options.data,
        //     maxImageSize: 1024 * 1024,
        //     cMapUrl: "",
        //     cMapPacked: true,
        // });
        this.loadingTask.onProgress = function (progressData) {
            self.progress(progressData.loaded / progressData.total);
        };

        return this.loadingTask.promise.then(
            function (pdf) {
                // Document loaded, specifying document for the viewer.
                self.document = pdf;
                self.viewer.setDocument(pdf);
                self.linkService.setDocument(pdf);
                self.history.initialize({ fingerprint: pdf.fingerprint });
                self.loadingBar.hide();
                self.setTitleUsingMetadata(pdf);
            },
            function (exception) {
                var message = exception && exception.message;
                var l10n = self.l10n;
                var loadingErrorMessage;
      
                if (exception instanceof pdfjsLib.InvalidPDFException) {
                    // change error message also for other builds
                    loadingErrorMessage = l10n.get(
                        "invalid_file_error",
                        null,
                        "Invalid or corrupted PDF file."
                    );
                } else if (exception instanceof pdfjsLib.MissingPDFException) {
                    // special message for missing PDFs
                    loadingErrorMessage = l10n.get(
                    "missing_file_error",
                    null,
                    "Missing PDF file."
                    );
                } else if (exception instanceof pdfjsLib.UnexpectedResponseException) {
                    loadingErrorMessage = l10n.get(
                    "unexpected_response_error",
                    null,
                    "Unexpected server response."
                    );
                } else {
                    loadingErrorMessage = l10n.get(
                    "loading_error",
                    null,
                    "An error occurred while loading the PDF."
                    );
                }
      
                loadingErrorMessage.then(function (msg) {
                    self.error(msg, { message: message });
                });
                self.loadingBar.hide();
            }
        );
    }
    close() {
        this.elemRefs.errorWrapper.setAttribute("hidden", "true");

        if (!this.loadingTask) {
            return Promise.resolve();
        }

        var promise = this.loadingTask.destroy();
        this.loadingTask = null;

        if (this.document) {
            this.document = null;
            this.viewer.setDocument(null);
            this.linkService.setDocument(null, null);

            // if (this.history) {
            //     this.history.reset();
            // }
        }

        return promise;
    }
    get loadingBar() {
        return pdfjsLib.shadow(this, "loadingBar", new pdfjsViewer.ProgressBar("#loadingBar", {}));
    }
    setTitleUsingUrl(url) {
        this.url = url;
        var title = url;
        try {
            title = pdfjsLib.getFilenameFromUrl(url);
            title = decodeURIComponent(title);
        } catch (e) {
            // decodeURIComponent may throw URIError,
            // fall back to using the unprocessed url in that case
        }
        this.setTitle(title);
    }
    setTitleUsingMetadata(pdf) {
        var self = this;
        pdf.getMetadata().then(function (data) {
            var info = data.info,
            metadata = data.metadata;
            self.documentInfo = info;
            self.metadata = metadata;

            // Provides some basic debug information
            console.log(
                "PDF " +
                    pdf.fingerprint +
                    " [" +
                    info.PDFFormatVersion +
                    " " +
                    (info.Producer || "-").trim() +
                    " / " +
                    (info.Creator || "-").trim() +
                    "]" +
                    " (PDF.js: " +
                    (pdfjsLib.version || "-") +
                    ")"
            );

            var pdfTitle;
            if (metadata && metadata.has("dc:title")) {
                var title = metadata.get("dc:title");
                // Ghostscript sometimes returns 'Untitled', so prevent setting the
                // title to 'Untitled.
                if (title !== "Untitled") {
                    pdfTitle = title;
                }
            }

            if (!pdfTitle && info && info.Title) {
                pdfTitle = info.Title;
            }

            if (pdfTitle) {
                self.setTitle(pdfTitle + " - " + document.title);
            }
        });
    }
    setTitle(title) {
        this.elemRefs.title.textContent = title;
    }
    error(message, moreInfo) {
        var self = this;
        var l10n = self.l10n;
        var moreInfoText = [
            l10n.get(
                "error_version_info",
                { version: pdfjsLib.version || "?", build: pdfjsLib.build || "?" },
                "PDF.js v{{version}} (build: {{build}})"
            ),
        ];
    
        if (moreInfo) {
            moreInfoText.push(
                l10n.get(
                    "error_message",
                    { message: moreInfo.message },
                    "Message: {{message}}"
                )
            );
            if (moreInfo.stack) {
                moreInfoText.push(
                    l10n.get("error_stack", { stack: moreInfo.stack }, "Stack: {{stack}}")
                );
            } else {
                if (moreInfo.filename) {
                    moreInfoText.push(
                        l10n.get(
                            "error_file",
                            { file: moreInfo.filename },
                            "File: {{file}}"
                        )
                    );
                }
                if (moreInfo.lineNumber) {
                    moreInfoText.push(
                        l10n.get(
                            "error_line",
                            { line: moreInfo.lineNumber },
                            "Line: {{line}}"
                        )
                    );
                }
            }
        }

        self.elemRefs.errorWrapper.removeAttribute("hidden");
        self.elemRefs.errorMessage.textContent = message;
        self.elemRefs.errorClose.onclick = function () {
            self.elemRefs.errorWrapper.setAttribute("hidden", "true");
        };
        self.elemRefs.errorMoreInfo.onclick = function () {
            self.elemRefs.errorMoreInfo.removeAttribute("hidden");
            self.elemRefs.errorShowMore.setAttribute("hidden", "true");
            self.elemRefs.errorShowLess.removeAttribute("hidden");
            self.elemRefs.errorMoreInfo.style.height = self.elemRefs.errorMoreInfo.scrollHeight + "px";
        };
        self.elemRefs.errorShowLess.onclick = function () {
            self.elemRefs.errorMoreInfo.setAttribute("hidden", "true");
            self.elemRefs.errorShowMore.removeAttribute("hidden");
            self.elemRefs.errorShowLess.setAttribute("hidden", "true");
        };
        self.elemRefs.errorShowMore.removeAttribute("hidden");
        self.elemRefs.errorShowLess.setAttribute("hidden", "true");
        Promise.all(moreInfoText).then(function (parts) {
            self.elemRefs.errorMoreInfo.value = parts.join("\n");
        });
    }
    progress(level) {
        var percent = Math.round(level * 100);
        // Updating the bar if value increases.
        if (percent > this.loadingBar.percent || isNaN(percent)) {
            this.loadingBar.percent = percent;
        }
    }
    get pagesCount() {
        return this.document.numPages;
    }

    get page() {
        return this.viewer.currentPageNumber;
    }

    set page(val) {
        this.viewer.currentPageNumber = val;
    }
    zoomIn(ticks) {
        var newScale = this.viewer.currentScale;
        do {
            newScale = (newScale * 1.1).toFixed(2);
            newScale = Math.ceil(newScale * 10) / 10;
            newScale = Math.min(10.0, newScale);
        } while (--ticks && newScale < 10.0);
        this.viewer.currentScaleValue = newScale;
    }
    zoomOut(ticks) {
        var newScale = this.viewer.currentScale;
        do {
            newScale = (newScale / 1.1).toFixed(2);
            newScale = Math.floor(newScale * 10) / 10;
            newScale = Math.max(0.25, newScale);
        } while (--ticks && newScale > 0.25);
        this.viewer.currentScaleValue = newScale;
    }
    toDataURL() {
        try {
            this.docGenerator.getDataUrl((dataUrl) => {
                return dataUrl;
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    toBase64() {
        return new Promise((resolve) => {
            this.docGenerator.getBase64((data) => {
                resolve(data);
            });
        });
    }
    toBuffer() {
        // try {
        //     this.docGenerator.getBuffer((buffer) => {
        //         return buffer;
        //     });
        // } catch (error) {
        //     console.log(error);
        //     return null;
        // }
        return new Promise((resolve) => {
            this.docGenerator.getBuffer((buffer) => {
                resolve(buffer);
            });
        });
    }
    toBlob() {
        try {
            this.docGenerator.getBlob((blob) => {
                return blob;
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    toStream() {
        try {
            return this.docGenerator.getStream();
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
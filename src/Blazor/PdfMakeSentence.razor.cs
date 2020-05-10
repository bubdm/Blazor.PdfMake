// Copyright (c) 2020 Allan Mobley. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

namespace Mobsites.Blazor
{
    /// <summary>
    /// UI component for rendering a paragraph in the pdf.
    /// </summary>
    public partial class PdfMakeSentence
    {
        /****************************************************
        *
        *  PUBLIC INTERFACE
        *
        ****************************************************/



        /****************************************************
        *
        *  NON-PUBLIC INTERFACE
        *
        ****************************************************/

        protected override void OnParametersSet()
        {
            // This will check for valid parent.
            base.OnParametersSet();
            if (!this.Parent.Sentences.Contains(this))
                this.Parent.Sentences.Add(this);
        }
    }
}
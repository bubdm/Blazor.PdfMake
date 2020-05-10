// Copyright (c) 2020 Allan Mobley. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Mobsites.Blazor
{
    /// <summary>
    /// UI component for rendering a pdf footer.
    /// </summary>
    public partial class PdfMakeBody
    {
        /****************************************************
        *
        *  PUBLIC INTERFACE
        *
        ****************************************************/

        /// <summary>
        /// Content to render.
        /// </summary>
        [Parameter] public RenderFragment ChildContent { get; set; }

        

        /****************************************************
        *
        *  NON-PUBLIC INTERFACE
        *
        ****************************************************/

        /// <summary>
        /// List of child reference. (Children add theirselves.)
        /// </summary>
        internal List<IPdfMakeBody> Children { get; set; } = new List<IPdfMakeBody>();

        private List<object> Content { get; set; } = new List<object>();

        protected override void OnParametersSet()
        {
            // This will check for valid parent.
            base.OnParametersSet();
            this.Parent.Body = this;
        }

        internal async Task<List<object>> GetContent()
        {
            this.Content.Clear();
            if (this.Children.Count > 0)
            {
                foreach (var child in this.Children)
                {
                    this.Content.Add(await child.GetDocumentDefinition());
                }
            }

            return this.Content;
        }

        public override void Dispose()
        {
            this.Children.Clear();
            this.Content.Clear();
            base.Dispose();
        }
    }
}
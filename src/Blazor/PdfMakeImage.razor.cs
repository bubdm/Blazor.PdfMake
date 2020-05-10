using System;
using System.Net.Http;
// Copyright (c) 2020 Allan Mobley. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Mobsites.Blazor
{
    /// <summary>
    /// UI component for rendering an image in the pdf.
    /// </summary>
    public partial class PdfMakeImage : IPdfMakeBody
    {
        /****************************************************
        *
        *  PUBLIC INTERFACE
        *
        ****************************************************/

        /// <summary>
        /// The data URL or URL fragment to image source.
        /// </summary>
        [Parameter] public string Src { get; set; }

        /// <summary>
        /// Image Width.
        /// </summary>
        [Parameter] public int? Width { get; set; }

        /// <summary>
        /// Image Height.
        /// </summary>
        [Parameter] public int? Height { get; set; }

        /// <summary>
        /// Whether to fit image inside a rectangle using Width and Height.
        /// </summary>
        [Parameter] public bool? Fit { get; set; }

        

        /****************************************************
        *
        *  NON-PUBLIC INTERFACE
        *
        ****************************************************/

        [Inject] protected HttpClient HttpClient { get; set; }

        protected override void OnParametersSet()
        {
            // This will check for valid parent.
            base.OnParametersSet();
            if (!this.Parent.Children.Contains(this))
                this.Parent.Children.Add(this);
        }

        public async Task<object> GetDocumentDefinition()
        {
            return JsonSerializer.Deserialize<object>(
                JsonSerializer.Serialize(
                new ImageOptions
                {
                    Image = await this.ToDataURL(),
                    Width = this.Width,
                    Height = this.Height,
                    Fit = this.Fit
                },
                new JsonSerializerOptions
                {
                    IgnoreNullValues = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }));
        }

        internal async Task<string> ToDataURL() => 
            "data:image/jpg;base64," + Convert.ToBase64String(await HttpClient.GetByteArrayAsync(this.Src));
        
        public override void Dispose()
        {
            base.Dispose();
        }

        internal class ImageOptions
        {
            public string Image { get; set; }
            public int? Width { get; set; }
            public int? Height { get; set; }
            public bool? Fit { get; set; }
        }
    }
}
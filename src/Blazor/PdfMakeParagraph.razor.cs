// Copyright (c) 2020 Allan Mobley. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components.Rendering;

namespace Mobsites.Blazor
{
    /// <summary>
    /// UI component for rendering a paragraph in the pdf.
    /// </summary>
    public partial class PdfMakeParagraph : IPdfMakeBody
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

        private RenderTreeBuilder RenderTreeBuilder { get; set; } = new RenderTreeBuilder();

        /// <summary>
        /// List of child reference. (Children add theirselves.)
        /// </summary>
        internal List<PdfMakeSentence> Sentences { get; set; } = new List<PdfMakeSentence>();

        private List<TextOptions> Text { get; set; } = new List<TextOptions>();

        public object DocumentDefinition { get; set; }

        protected override void OnParametersSet()
        {
            // This will check for valid parent.
            base.OnParametersSet();
            if (!this.Parent.Children.Contains(this))
                this.Parent.Children.Add(this);
        }

        // protected override void OnAfterRender(bool firstRender)
        // {
        //     if (firstRender)
        //     {
        //         this.Text.Clear();
        //         this.RenderTreeBuilder.Clear();
        //         this.DocumentDefinition = this.GetDocumentDefinition();
        //     }
        // }

        public Task<object> GetDocumentDefinition()
        {
            if (this.Sentences.Count > 0)
            {
                foreach (var sentence in this.Sentences)
                {
                    sentence.ChildContent.Invoke(this.RenderTreeBuilder);

                    var frames = this.RenderTreeBuilder.GetFrames();

#pragma warning disable
                    var text = FormatWhitespace(frames.Array[0].TextContent);
#pragma warning restore

                    this.Text.Add(new TextOptions
                    {
                        Text = text + " ",
                        Font = sentence.Font ?? this.Font,
                        FontSize = sentence.FontSize ?? this.FontSize,
                        Italics = sentence.Italics ?? this.Italics,
                        Bold = sentence.Bold ?? this.Bold
                    });

                    this.RenderTreeBuilder.Clear();
                }
            }
            else
            {
                this.ChildContent.Invoke(this.RenderTreeBuilder);

                var frames = this.RenderTreeBuilder.GetFrames();

#pragma warning disable
                var text = FormatWhitespace(frames.Array[0].TextContent);
#pragma warning restore

                this.Text.Add(new TextOptions
                {
                    Text = text,
                    Font = this.Font,
                    FontSize = this.FontSize,
                    Italics = this.Italics,
                    Bold = this.Bold
                });
            }

            this.Text.Add(new TextOptions
            {
                Text = "\n\n"
            });

            return Task.FromResult(JsonSerializer.Deserialize<object>(
                JsonSerializer.Serialize(
                new
                {
                    this.Text
                },
                new JsonSerializerOptions
                {
                    IgnoreNullValues = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                })));
        }

        private string FormatWhitespace(string text)
        {
            /*****************************************************
             *  
             *  Control all whitespace.
             *  Cannot simply use Regex.Replace since the return 
             *      string is not playing nicely with pdfmake.js.
             *
             ****************************************************/

            try
            {
                MatchCollection matches = Regex.Matches(text, @"\s*");
                foreach (Match match in matches)
                {
                    if (match.Value.Length > 0)
                        text = text.Replace(match.Value, " ");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return text;
        }

        public override void Dispose()
        {
            this.Sentences.Clear();
            this.Text.Clear();
            this.RenderTreeBuilder.Clear();
            base.Dispose();
        }

        internal class TextOptions
        {
            public string Text { get; set; }
            public string Font { get; set; }
            public int? FontSize { get; set; }
            public bool? Italics { get; set; }
            public bool? Bold { get; set; }
        }
    }
}
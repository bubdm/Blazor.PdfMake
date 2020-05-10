// Copyright (c) 2020 Allan Mobley. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

using Microsoft.AspNetCore.Components;

namespace Mobsites.Blazor
{
    /// <summary>
    /// UI component for rendering a pdf footer.
    /// </summary>
    public abstract class PdfMakeText<T> : ChildComponent<T>
        where T : IParentComponentBase
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

        /// <summary>
        /// Whether to use italic text.
        /// </summary>
        [Parameter] public virtual string Font { get; set; }

        /// <summary>
        /// Whether to use italic text.
        /// </summary>
        [Parameter] public virtual int? FontSize { get; set; }

        /// <summary>
        /// Whether to use italic text.
        /// </summary>
        [Parameter] public virtual bool? Italics { get; set; }

        /// <summary>
        /// Whether to use bold text.
        /// </summary>
        [Parameter] public virtual bool? Bold { get; set; }



        /****************************************************
        *
        *  NON-PUBLIC INTERFACE
        *
        ****************************************************/

        
    }
}
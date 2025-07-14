// =======================================================================
// ARCHIVO: src/components/MarkdownRenderer.jsx
// =======================================================================
import React from 'react';

export default function MarkdownRenderer({ text, className }) {
    if (!text) return null;
    const html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold my-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold my-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold my-4">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
/* eslint-disable */
/* global WebImporter */

/**
 * Parser for video-hero block
 * 
 * Source: https://pnamadobe.github.io/nfl-brand-guidelines/prototype.html
 * Base Block: video
 * 
 * Block Structure:
 * - Row 1: Video URL or video element
 * 
 * Source HTML Pattern:
 * <section class="hero-viewport">
 *   <div class="video-wrapper">
 *     <video><source src="..."></video>
 *   </div>
 * </section>
 * 
 * Generated: 2026-02-02
 */
export default function parse(element, { document }) {
  // Extract video source from source element or video tag
  const video = element.querySelector('video source');
  const videoSrc = video ? video.getAttribute('src') : null;
  
  // Also check for iframe embeds
  const iframe = element.querySelector('iframe');
  const iframeSrc = iframe ? iframe.getAttribute('src') : null;
  
  // Get the video URL
  const videoUrl = videoSrc || iframeSrc || '';
  
  // Build cells array
  const cells = [];
  
  // Row 1: Video URL
  if (videoUrl) {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;
    cells.push([link]);
  }
  
  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Video-Hero', cells });
  
  // Replace original element with structured block table
  element.replaceWith(block);
}

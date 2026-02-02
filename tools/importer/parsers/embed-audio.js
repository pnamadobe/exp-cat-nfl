/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-audio block (sonic mnemonic)
 * 
 * Source: https://pnamadobe.github.io/nfl-brand-guidelines/prototype.html
 * Base Block: embed
 * 
 * Block Structure:
 * - Row 1: Audio link/embed URL
 * 
 * Source HTML Pattern:
 * <section id="sonic" class="sonic-box">
 *   <h2>04 Sonic Mnemonic</h2>
 *   <div id="waveform"></div>
 *   <button class="btn-play">PLAY THEME</button>
 * </section>
 * 
 * Generated: 2026-02-02
 */
export default function parse(element, { document }) {
  // Look for audio source or button
  const button = element.querySelector('.btn-play, button');
  const audio = element.querySelector('audio source');
  
  // Build cells array
  const cells = [];
  
  // Row 1: Audio link or placeholder
  const contentCell = document.createElement('div');
  
  if (audio) {
    const audioSrc = audio.getAttribute('src');
    const link = document.createElement('a');
    link.href = audioSrc;
    link.textContent = 'Play Theme';
    contentCell.appendChild(link);
  } else if (button) {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = button.textContent.trim() || 'Play Theme';
    contentCell.appendChild(link);
  }
  
  cells.push([contentCell]);
  
  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Embed-Audio', cells });
  
  // Replace original element with structured block table
  element.replaceWith(block);
}

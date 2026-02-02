/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-gallery block (photo principles)
 * 
 * Source: https://pnamadobe.github.io/nfl-brand-guidelines/prototype.html
 * Base Block: cards
 * 
 * Block Structure (2-column table):
 * - Row N: [image] | [label]
 * 
 * Source HTML Pattern:
 * <div class="photo-grid">
 *   <div class="photo-card">
 *     <img src="...">
 *     <span>Label</span>
 *   </div>
 * </div>
 * 
 * Generated: 2026-02-02
 */
export default function parse(element, { document }) {
  // Extract all photo cards
  const cards = Array.from(element.querySelectorAll('.photo-card'));
  
  // Build cells array - one row per card
  const cells = [];
  
  cards.forEach(card => {
    // Get image
    const img = card.querySelector('img');
    
    // Get label
    const labelEl = card.querySelector('span');
    const label = labelEl ? labelEl.textContent.trim() : '';
    
    // Build image cell
    let imageCell;
    if (img) {
      const picture = document.createElement('picture');
      const imgClone = img.cloneNode(true);
      picture.appendChild(imgClone);
      imageCell = picture;
    } else {
      imageCell = document.createElement('div');
    }
    
    // Build label cell
    const labelCell = document.createElement('strong');
    labelCell.textContent = label;
    
    // Row: [image] | [label]
    cells.push([imageCell, labelCell]);
  });
  
  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Gallery', cells });
  
  // Replace original element with structured block table
  element.replaceWith(block);
}

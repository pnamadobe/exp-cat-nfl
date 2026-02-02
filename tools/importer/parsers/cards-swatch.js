/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-swatch block (color palette)
 * 
 * Source: https://pnamadobe.github.io/nfl-brand-guidelines/prototype.html
 * Base Block: cards
 * 
 * Block Structure (2-column table):
 * - Row N: [empty/color] | [color name, hex value]
 * 
 * Source HTML Pattern:
 * <div class="palette-grid">
 *   <div class="swatch">
 *     <span>Color Name</span>
 *     <small>#hexcode</small>
 *   </div>
 * </div>
 * 
 * Generated: 2026-02-02
 */
export default function parse(element, { document }) {
  // Extract all color swatches
  const swatches = Array.from(element.querySelectorAll('.swatch'));
  
  // Build cells array - one row per swatch
  const cells = [];
  
  swatches.forEach(swatch => {
    // Get color name
    const nameEl = swatch.querySelector('span');
    const colorName = nameEl ? nameEl.textContent.trim() : '';
    
    // Get hex value
    const hexEl = swatch.querySelector('small');
    const hexValue = hexEl ? hexEl.textContent.trim() : '';
    
    // Build content cell
    const contentCell = document.createElement('div');
    
    const nameP = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = colorName;
    nameP.appendChild(strong);
    contentCell.appendChild(nameP);
    
    const hexP = document.createElement('p');
    hexP.textContent = hexValue;
    contentCell.appendChild(hexP);
    
    // Row: [empty cell for color] | [name and hex]
    cells.push([document.createElement('div'), contentCell]);
  });
  
  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Swatch', cells });
  
  // Replace original element with structured block table
  element.replaceWith(block);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.control = exports.ledElement = exports.ledStyle = void 0;
const glowSize = 7;
const ledStyle = (color, glow, sizeMultiplier) => {
    if (glow) {
        return `
      background-color: ${color};
      box-shadow:
        #0000009e 0 0px 1px 0px,
        ${color} 0 0px ${glowSize * sizeMultiplier}px ${Math.floor((glowSize * sizeMultiplier) / 3)}px,
    inset #00000017 0 -1px 1px 0px;`;
    }
    else {
        // TODO: duplicate code because of execution scope, fix this shit :|
        return `
      background-color: ${color}; 
      box-shadow:
        #0000009e 0 0px 1px 0px,
        inset #ffffff8c 0px 1px 2px,
        inset #00000033 0 -1px 1px 0px,
        inset ${color} 0 -1px 2px;`;
    }
};
exports.ledStyle = ledStyle;
// HACK: workaround because ratio trick isn't working consistently across browsers
const nodeRedDashboardUICardVerticalPadding = 3 * 2;
// const nodeRedDashboardUICardHorizontalPadding = 6 * 2
const nodeRedDashboardUICardHeight = (sizeMultiplier) => {
    let height = 48 + (sizeMultiplier - 1) * 54;
    if (height >= 4) {
        height -= 6; // For some reason the difference between 3 and 4 is 48
    }
    return height - nodeRedDashboardUICardVerticalPadding;
};
const ledElement = (controlClass, ledId, shape, color, glow, sizeMultiplier) => {
    const showCurveReflection = false; // TODO: Needs visual work and potentially make an option for poeple who like the old style better
    const ledContainerPadding = (glowSize + 4) * sizeMultiplier;
    const length = nodeRedDashboardUICardHeight(sizeMultiplier) - ledContainerPadding * 2;
    // TODO: if show glow is turned off we should not include this padding for the glow?
    const ledContentsStyle = String.raw `
    div.${controlClass}.led_contents {
      min-height: ${length}px;
      min-width: ${length}px;
      height: ${length}px;
      width: ${length}px;
      max-height: ${length}px;
      max-width: ${length}px;
      text-align: center;
      margin: ${ledContainerPadding}px;
      ${shape === 'circle' ? `border-radius: 50%;` : ''}
    }`;
    const ledCurveShineReflectionStyle = String.raw `
    .${controlClass}.curveShine {
      width: 70%; 
      height: 70%; 
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(0,255,31,0) 60%);'
    }`;
    const styles = String.raw `
        ${ledContentsStyle}
        ${ledCurveShineReflectionStyle}
    `;
    const ledCurveReflection = String.raw `
        <div class='${controlClass} curveShine'></div>`;
    const ledContentsElement = String.raw `
    <div 
      class='${controlClass} led_contents' 
      id='${ledId}' 
      style='${exports.ledStyle(color, glow, sizeMultiplier)}'>
      ${showCurveReflection ? ledCurveReflection : ''}
    </div>`;
    return String.raw `
    <style>
        ${styles}
    </style>
    ${ledContentsElement}`;
};
exports.ledElement = ledElement;
const control = (controlClass, ledId, label, labelPlacement, labelAlignment, shape, color, glow, sizeMultiplier) => {
    const hasName = () => {
        return typeof label === 'string' && label !== '';
    };
    const name = () => {
        if (hasName()) {
            return `<span class=\"name\">` + label + `</span>`;
        }
        return '';
    };
    const optionalName = (display) => {
        if (display) {
            return name();
        }
        return '';
    };
    const controlStyle = String.raw `
    div.${controlClass}.control {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;

      justify-content: ${hasName() ? 'space-between' : 'center'};
      align-items: center;

      height: 100%;
      width: 100%;
      position: relative;

      overflow: hidden;
    }`;
    const labelStyle = String.raw `
    div.${controlClass} > span.name {
      text-align: ${labelAlignment};
      margin-left: 6px;
      margin-right: 6px;
      overflow-wrap: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-grow: 1;
    }`;
    const style = String.raw `<style>
      ${controlStyle}
      ${labelStyle}
    </style>`;
    const allElements = String.raw `
    <div class="${controlClass} control">
      ${optionalName(labelPlacement !== 'right')}
      ${exports.ledElement(controlClass, ledId, shape, color, glow, sizeMultiplier)}
      ${optionalName(labelPlacement === 'right')}
    </div>`;
    return style + allElements;
};
exports.control = control;
//# sourceMappingURL=rendering.js.map
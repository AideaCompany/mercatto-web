export function hexToRgb(hex:string): string {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const rgb = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } 

    return `linear-gradient(0deg, rgba(${rgb.r},${rgb.g},${rgb.b},1) 0%, rgba(${rgb.r},${rgb.g},${rgb.b},0.8) 100%);`
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
const MAX_LENGTH = 5;
function generate() {
    const subSet = "123456789abcdefghijklmnopqrstuvwxyz";
    let key = "";
    for (let i = 0; i < MAX_LENGTH; i++) {
        key += subSet.charAt(Math.floor(Math.random() * subSet.length));
    }
    return key;
}

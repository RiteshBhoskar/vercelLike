const MAX_LENGTH = 5

export function generate() {
    const subSet = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let key = "";
    for (let i = 0; i < MAX_LENGTH; i++) {
        key += subSet.charAt(Math.floor(Math.random() * subSet.length));
    }
    return key;
}